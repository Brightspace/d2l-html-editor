(function() {
	'use strict';
	tinymce.PluginManager.add('d2l_lang', function() {
		var test = tinymce.EditorManager.i18n.translate('Graphical equation');
		console.log(test);
		//tinymce.ScriptLoader.load(tinymce.EditorManager.activeEditor.settings.d2l_html_editor.appRoot + '../d2l-html-editor/langs/d2l-ar-sa.js');
	});
})();
