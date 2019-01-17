import './d2l-html-editor-plugin.js';
/**
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
/*global tinymce:true */
/** @polymerBehavior */
var CodeBehavior = {
	plugin: {
		addPlugin: function(client) {
			var pluginConfig = {
				id: 'd2l_code',
				label: 'HTML Source Editor',
				icon: 'code',
				serviceId: 'fra-html-editor-code'
			};
			return client.getService(pluginConfig.serviceId, '0.1').then(function(service) {
				return service.config().then(function(config) {

					tinymce.PluginManager.add(pluginConfig.id, function(editor) {
						function showDialog() {
							var win = editor.windowManager.open({
								title: pluginConfig.label,
								body: {
									type: 'textbox',
									name: pluginConfig.icon,
									multiline: true,
									minWidth: editor.getParam('code_dialog_width', 600),
									minHeight: editor.getParam('code_dialog_height', Math.min(tinymce.DOM.getViewPort().h - 200, 200)),
									spellcheck: false,
									style: 'direction: ltr; text-align: left'
								},
								onSubmit: function(e) {
									// We get a lovely "Wrong document" error in IE 11 if we
									// don't move the focus to the editor before creating an undo
									// transation since it tries to make a bookmark for the current selection
									client.getService('convert-to-viewable-html', '0.1').then(function(service) {
										if (editor.getParam('d2l_html_editor').allowUnsafe) {
											return e.data.code;
										}
										return service.filterHtml(e.data.code);
									}).then(function(response) {
										editor.focus();

										editor.undoManager.transact(function() {
											editor.setContent(response);
										});

										editor.selection.setCursorLocation();
										editor.nodeChanged();
									});
								}
							});

							// modifying some css properties of the textarea that can't be
							// changed through skinning tinymce
							var codeTextArea = win.getEl().getElementsByTagName('textarea')[0];
							codeTextArea.style.left = '0px';
							codeTextArea.style.width = '98%';
							codeTextArea.style.height = '88%';
							codeTextArea.style.removeProperty('top');

							// Gecko has a major performance issue with textarea
							// contents so we need to set it when all reflows are done
							win.find('#code').value(editor.getContent({source_view: true}));
						}

						if (config.isEnabled) {

							editor.addButton(pluginConfig.id, {
								icon: pluginConfig.icon,
								tooltip: pluginConfig.label,
								onclick: showDialog
							});
						}
					});
				});
			}).catch(function() {
				tinymce.PluginManager.add(pluginConfig.id, function() {   // eslint-disable-line no-undef
				});
			});
		}
	}
};
window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.Code = CodeBehavior;
