(function() {
	'use strict';
	/*global tinymce:true */

	function request(type) {
		switch (type) {
			case 'valenceHost':
				return Promise.resolve(window.location.origin);
		}
	}

	function insertStuff() {
		return Promise.resolve({
			config: function() {
				return Promise.resolve({
					isEnabled: true
				});
			},
			click: function(openerId) {
				return new Promise(function(resolve, reject) {
					var nav = new D2L.Nav();
					var location = new D2L.LP.Web.Http.UrlLocation('/d2l/common/dialogs/isf/selectItem.d2l')
						.WithQueryString('ou', nav.GetParam('ou'))
						.WithQueryString('filterMode', 'Strict');
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

	function loadService(serviceType) {
		switch (serviceType) {
			case 'convert-to-viewable-html':
				return convertToViewableHtml();
			case 'fra-html-editor-isf':
				return insertStuff();
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

	function getService(serviceType /*, version*/) {
		return loadService(serviceType);
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
