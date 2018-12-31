import './d2l-html-editor-plugin.js';
/*global tinymce:true */
function createTinyMceFormatString(fontFamilies) {
	var fontFormats = fontFamilies.reduce(function(formats, font) {
		if (font.Value) {
			var fontFamily = font.Name.concat('=').concat(font.Value);
			return formats.concat(fontFamily).concat(';');
		} else {
			return formats;
		}
	}, '');
	return fontFormats;
}

function addPlugin(client, pluginConfig) {
	// Add an empty plugin so this plugin can be configured using the plugins list
	tinymce.PluginManager.add('d2l_fontfamily', function() {
	});

	return client.getService('fra-html-editor-font-family', '0.1').then(function(service) {
		return service.config().then(function(config) {
			if (config.isEnabled) {
				return service.get().then(function(fontFamilies) {
					pluginConfig.font_formats = createTinyMceFormatString(fontFamilies);
				});
			}
		});
	}).catch(function() {
	});
}

/** @polymerBehavior */
var FontFamilyBehavior = {
	plugin: {
		addPlugin: addPlugin
	}
};

window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.FontFamily = FontFamilyBehavior;
