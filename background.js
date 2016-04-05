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
					// Search already open incognito windows and use them.
					chrome.windows.getAll({populate: false}, function(windows) {
						openIncognito(windows, url, storage.reuse, function() {
							// Remove Tab and History entry.
							chrome.tabs.remove(tab.id);
							chrome.history.deleteUrl({url: url});
						});
					});
				}
			});
		}
	}

	function openIncognito(windows, url, reuse, callback) {
		var i, w;
		if (windows && reuse) {
			for (i = 0; i < windows.length; ++i) {
				w = windows[i];
				if (w.incognito) {
					chrome.tabs.create({windowId: w.id, url: url});
					chrome.windows.update(w.id, {focused: true}, callback);
					return;
				}
			}
		}
		chrome.windows.create({incognito: true, url: url}, callback);
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
