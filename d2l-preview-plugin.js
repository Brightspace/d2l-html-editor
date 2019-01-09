import './d2l-html-editor-plugin.js';

function command(service, editor) {
	var html = editor.getContent();
	service.click(html).then(function() {
		editor.focus();
	}, function() {
		editor.focus();
	});
}

function addPlugin(client) {
	return window.D2LHtmlEditor.PolymerBehaviors.Plugin.configureSimpleService(
		client, {
			id: 'd2l_preview',
			label: 'Preview',
			icon: 'd2l_preview',
			serviceId: 'fra-html-editor-preview',
			cmd: command,
			init: function() {}
		});
}

/** @polymerBehavior */
var PreviewBehavior = {
	plugin: {
		addPlugin: addPlugin
	}
};

window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.Preview = PreviewBehavior;
