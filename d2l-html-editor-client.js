(function() {
	'use strict';

	function request(type) {
		switch (type) {
			case 'valenceHost':
				return Promise.resolve(window.location.origin);
		}
	}

	function convertToViewableHtml() {
		return {
			filterHtml: function(html) {
				return new Promise(function(resolve, reject) {
					var params = {
						filterMode: 1, // strict mode for html filtering. Refer to D2L.LP.TextProcessing.FilterModes
						html: html
					};

					var options = {
						success: resolve,
						failure: reject
					};

					D2L.LP.Web.UI.Rpc.Connect(
						D2L.LP.Web.UI.Rpc.Verbs.POST,
						new D2L.LP.Web.Http.UrlLocation('/d2l/lp/htmleditor/converttoabsolute'),
						// .WithQueryString('ou', orgUnitId),
						params,
						options
					);
				});
			}
		};
	}

	function loadService(serviceType) {
		switch (serviceType) {
			case 'convert-to-viewable-html':
				return convertToViewableHtml();
			default:
				return {
					config: function() {
						return Promise.resolve({
							isEnabled: false
						});
					}
				};
		}
	}

	function getService(serviceType /*, version*/) {
		return Promise.resolve(loadService(serviceType));
	}

	function connect() {
		return Promise.resolve();
	}

	function client() {
		return {
			connect: connect,
			request: request,
			getService: getService
		};
	}

	window.D2LHtmlEditor = window.D2LHtmlEditor || {};
	window.D2LHtmlEditor.client = client;

})();
