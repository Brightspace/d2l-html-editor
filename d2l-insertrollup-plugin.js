import './d2l-html-editor-plugin.js';
/*global tinymce:true */
/** @polymerBehavior */
var InsertRollupBehavior = {
	plugin: {
		addPlugin: function() {
			tinymce.PluginManager.add('d2l_insertrollup', function(editor) {
				editor.addButton('d2l_insertrollup', {
					type   : 'MenuButton',
					icon   : 'arrowdown',
					title  : 'Insert',
					tooltip: 'More Insert Options',
					menu   : [editor.menuItems.charmap, editor.menuItems.hr, editor.menuItems.d2l_attributes, editor.menuItems.d2l_emoticons]
				});
			});
		}
	}
};

window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.InsertRollup = InsertRollupBehavior;
