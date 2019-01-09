(function() {
	'use strict';

	function request(type, pluginSettings) {
		switch (type) {
			case 'valenceHost':
				return Promise.resolve(window.location.origin);
			case 'orgUnit':
				return Promise.resolve(pluginSettings.orgUnit || {});
		}
	}

	function loadService(serviceType) {
		switch (serviceType) {
			default:
				return Promise.resolve({
					config: function() {
						return Promise.resolve({
							isEnabled: false
						});
					}
				});
		}
	}

	function Client() {
		this.connected = new Promise(function(resolve) {
			this.configureSettings = function(settings) {
				this.pluginSettings = settings;
				resolve();
			};
		}.bind(this));

		this.connect = function() {
			return this.connected;
		};

		this.request = function(type) {
			return request(type, this.pluginSettings || {});
		};

		this.getService = function(serviceType /*, version*/) {
			return loadService(serviceType, this.pluginSettings || {});
		};
	}

	function client() {
		return new Client();
	}

	window.D2LHtmlEditor = window.D2LHtmlEditor || {};
	window.D2LHtmlEditor.client = client;

})();
