import './d2l-html-editor-plugin.js';

function command(service, editor) {
	var bookmark = editor.selection.getBookmark();
	service.click().then(function(response) {
		// setTimeout 10 required for IE to get focus back
		// document.activeELement.blur() required for Chrome to get focus back
		// moveToBookmark required by IE
		setTimeout(function() {
			document.activeElement.blur();
			editor.focus();
			editor.selection.moveToBookmark(bookmark);
			editor.execCommand('mceInsertContent', false, response);
		}, 10);
	}, function() {
		setTimeout(function() {
			editor.focus();
			editor.selection.moveToBookmark(bookmark);
			window.D2LHtmlEditor.PolymerBehaviors.Plugin.clearBookmark(editor, bookmark);
			// for reasons the image and isf dialogs require a longer timeout in IE otherwise
			// editor.focus() will not focus the editor...
		}, 500);
	});
}

function addPlugin(client) {
	return window.D2LHtmlEditor.PolymerBehaviors.Plugin.configureSimpleService(
		client, {
			id: 'd2l_image',
			label: 'Add Image',
			icon: 'd2l_image',
			serviceId: 'fra-html-editor-image',
			cmd: command,
			init: function() {}
		});
}

/** @polymerBehavior */
var ImageBehavior = {
	plugin: {
		addPlugin: addPlugin
	}
};

window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.Image = ImageBehavior;
