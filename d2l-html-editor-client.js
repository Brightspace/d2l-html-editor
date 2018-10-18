(function() {
	'use strict';
	/*global tinymce:true */

	function request(type) {
		switch (type) {
			case 'valenceHost':
				return Promise.resolve(window.location.origin);
		}
	}

	function insertStuff(pluginSettings) {
		return Promise.resolve({
			config: function() {
				return Promise.resolve({
					isEnabled: pluginSettings.hasOwnProperty('d2l_isf')
				});
			},
			click: function(openerId) {
				return new Promise(function(resolve, reject) {
					var location = new D2L.LP.Web.Http.UrlLocation(pluginSettings.d2l_isf.endpoint);
					var openEvent = D2L.LP.Web.UI.Legacy.MasterPages.Dialog.Open(
						new D2L.LP.Web.UI.Html.AbsoluteHtmlId.Create(openerId),
						location,
						'GetSelectedItem',
						'', /* resizeCallback*/
						'itemSource',
						975,
						650,
						tinymce.EditorManager.i18n.translate('Close'),
						[{
							IsEnabled: true,
							IsPrimary: true,
							Key: 'BTN_next',
							Param: 'next',
							ResponseType: 1,
							Text: tinymce.EditorManager.i18n.translate('Next')
						}], /* buttons */
						false /* forceTriggerOnCancel */
					);
					openEvent.AddListener(function(result) {
						resolve(result);
					});
					openEvent.AddReleaseListener(function() {
						reject();
					});
				});
			}
		});
	}

	function convertToViewableHtml() {
		if (!D2L.LP) {
			return Promise.reject('not enabled');
		}
		return Promise.resolve({
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
		});
	}

	function loadService(serviceType, pluginSettings) {
		switch (serviceType) {
			case 'convert-to-viewable-html':
				return convertToViewableHtml();
			case 'fra-html-editor-isf':
				return insertStuff(pluginSettings);
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

	function connect() {
		return Promise.resolve();
	}

	function Client() {
		this.connect = connect;
		this.request = request;
		this.getService = function getService(serviceType /*, version*/) {
			return loadService(serviceType, this.pluginSettings || {});
		};
	}

	function client() {
		return new Client();
	}

	window.D2LHtmlEditor = window.D2LHtmlEditor || {};
	window.D2LHtmlEditor.client = client;

})();
