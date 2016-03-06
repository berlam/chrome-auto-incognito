(function(chrome) {
	'use strict';
	function match(regexp, chars) {
		if (!regexp || !chars) {
			return false;
		}
		try {
			return new RegExp(regexp).test(chars);
		} catch (ex) {
			return false;
		}
	}

	function testIncognito(tab, url) {
		if (!tab.incognito && !match('^(chrome|chromium|chrome-extension):', url)) {
			chrome.storage.sync.get(null, function(storage) {
				if (match(storage.regexp, url) !== storage.invert) {
					processIncognitoRequest(tab, url, function(windows) {
						searchIncognitoWindow(windows, url, storage.reuse);
					});
				}
			});
		}
	}

	function processIncognitoRequest(tab, url, callback) {
		// Remove Tab and History entry.
		chrome.tabs.remove(tab.id);
		chrome.history.deleteUrl({url: url});
		// Search already open incognito windows and use them.
		chrome.windows.getAll({populate: false}, callback);
	}

	function searchIncognitoWindow(windows, url, reuse) {
		var i, window;
		if (windows && reuse) {
			for (i = 0; i < windows.length; ++i) {
				window = windows[i];
				if (window.incognito) {
					chrome.tabs.create({windowId: window.id, url: url});
					chrome.windows.update(window.id, {focused: true});
					return;
				}
			}
		}
		chrome.windows.create({incognito: true, url: url});
	}

	chrome.tabs.onCreated.addListener(function(tab) {
		if (tab.url !== undefined) {
			testIncognito(tab, tab.url);
		}
	});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.url !== undefined) {
			testIncognito(tab, changeInfo.url);
		}
	});
	chrome.windows.onCreated.addListener(function(tab) {
		if (tab.url !== undefined) {
			testIncognito(tab, tab.url);
		}
	});
	chrome.runtime.onInstalled.addListener(function(details) {
		if (details.reason === 'install' || details.reason === 'update') {
			chrome.storage.sync.get(null, function(storage) {
				if (storage) {
					chrome.storage.sync.clear(function() {
						chrome.storage.sync.set({
							regexp: storage.regexp,
							invert: storage.invert === true,
							reuse: storage.reuse === true
						});
					});
				}
			});
		}
	});
}(chrome));
