// This hocus pocus is to avoid the need for clients to have to explicitly add a script tag
// to include tinymce.
// TinyMCE uses the location of the script file to find other assets like themes and plugins.
// It uses a couple of strategies to find the location of the script file including looking for
// a script tag in the document and examining document.currentScript. Neither of these work
// when tinymce is included using an es6 import with Polymer. However, it does have an undocumented
// mechanism to use a `tinyMCEPreInit` object to set the base URL. So we are using that
// here. However, to ensure this is set before the tinymce import is processed, we have to use a dynamic
// import. Hence we dynamically import tinymce, and then we dynamically import the d2l-html-editor
// component.
const tinymceBaseUrl = 'https://s.brightspace.com/lib/tinymce/dev/4.8.5-a11ychecker.1.2.1-53-powerpaste.3.3.3-308-shadow-dom-fork-1';
window.tinyMCEPreInit = {
	baseURL: tinymceBaseUrl,
	suffix: ''
};
import(tinymceBaseUrl + '/tinymce.js').then(function() {
	import('./d2l-html-editor-component.js');
});
