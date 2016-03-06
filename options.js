(function(chrome) {
	'use strict';
	function read() {
		chrome.storage.sync.get(null, function(storage) {
			if (storage) {
				document.getElementById('regexp').value = storage.regexp;
				document.getElementById('invert').checked = storage.invert;
				document.getElementById('reuse').checked = storage.reuse;
			}
		});
	}

	function setStorageValue(value) {
		chrome.storage.sync.set(value);
	}

	function updateRegExp() {
		var that = this;
		setStorageValue({regexp: that.value});
	}

	function updateInvert() {
		var that = this;
		setStorageValue({invert: that.checked});
	}

	function updateReuse() {
		var that = this;
		setStorageValue({reuse: that.checked});
	}

	document.addEventListener('DOMContentLoaded', read);
	document.getElementById('regexp').addEventListener('change', updateRegExp);
	document.getElementById('invert').addEventListener('change', updateInvert);
	document.getElementById('reuse').addEventListener('change', updateReuse);
}(chrome));
