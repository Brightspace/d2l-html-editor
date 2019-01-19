/*<link rel="import" href="./vui-input-styles.html">*/
/**
An element providing a solution to no problem in particular.

Example:

		<d2l-html-editor></d2l-html-editor>

@demo
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

// Removing this updated dependency on d2l-fetch until the d2l-fetch strategy is clearer.
// This default import could cause the window.d2lfetch instance setup by clients of this
// component to be overwritten including any middleware they setup.
// For now the README will be updated to incidate that this component expects an
// appropriately configured instance of d2l-fetch to be available on the window object.
// import 'd2l-fetch/d2l-fetch.js';

import './d2l-insertstuff-plugin.js';
import './d2l-insertstuff-styles.js';
import './d2l-image-plugin.js';
import './d2l-textstylerollup-plugin.js';
import './d2l-formatrollup-plugin.js';
import './d2l-insertrollup-plugin.js';
import './d2l-link-plugin.js';
import './d2l-equation-editor-plugin.js';
import './d2l-code-plugin.js';
import './d2l-replacestring-plugin.js';
import './d2l-fontfamily-plugin.js';
import './d2l-attributes-plugin.js';
import './d2l-preview-plugin.js';
import './d2l-xsplconverter-plugin.js';
import './d2l-filter-plugin.js';
import './d2l-placeholder-plugin.js';
import './d2l-fullpage-plugin.js';
import './d2l-emoticons-plugin.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { pathFromUrl } from '@polymer/polymer/lib/utils/resolve-url.js';

// function addScript(src) {
// 	const script = document.createElement('script');
// 	script.src = src;
// 	document.head.appendChild(script);
// }

function addLink(rel, name) {
	const link = document.createElement('link');
	link.rel = rel;
	link.href = pathFromUrl(import.meta.url) + name;
	document.head.appendChild(link);
}

// addScript('https://s.brightspace.com/lib/tinymce/dev/4.8.5-a11ychecker.1.2.1-53-powerpaste.3.3.3-308-shadow-dom-fork-1/tinymce.js');

const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-html-editor">

	<template strip-whitespace="">

		<style include="d2l-insertstuff-styles">
			:host {
				display: block;
				position: relative;
			}

			:host ::slotted(.toolbar) {
				position: absolute;
				top: -2.9rem;
				z-index: 1001;
				display: inline-block;
				right: 0;
			}

			:host-context([dir='rtl']) ::slotted(.toolbar) {
				left: 0;
				right: inherit;
			}

			:host(:dir(rtl)) ::slotted(.toolbar) {
				left: 0;
				right: inherit;
			}

		</style>
		<slot></slot>
	</template>


</dom-module>`;

document.head.appendChild($_documentContainer.content);
/* global tinymce: true */
Polymer({

	is: 'd2l-html-editor',
	get importMeta() {
		return import.meta;
	},
	behaviors: [
		/**
		 * Do not place plugin behaviors here
		 * Place plugin behaviors in the _getPluginBehavior function
		 */
	],

	/**
	 * @see tinymce config
	 */
	properties: {
		d2lPluginSettings: {
			type: String,
			observer: '_d2lPluginSettingsChanged',
		},
		key: {
			type: String,
			observer: '_keyChanged',
		},
		inline: {
			type: Number,
			value: 1
		},
		autoFocus: {
			type: Number,
			value: 0
		},
		minRows: {
			type: Number,
			value: 1
		},
		maxRows: {
			type: Number,
			value: 3
		},
		totalPadding: {
			type: Number,
			value: 0.9
		},
		lineHeight: {
			type: Number,
			value: 1.2
		},
		minHeight: {
			type: String,
			computed: 'computeHeight(totalPadding, minRows, lineHeight)'
		},
		maxHeight: {
			type: String,
			computed: 'computeHeight(totalPadding, maxRows, lineHeight)'
		},
		editorId: String,
		toolbarId: {
			type: String,
			computed: 'computeToolbarId(editorId)'
		},
		content: {
			type: String
		},
		baseUrl: {
			type: String,
			value: null
		},
		documentBaseUrl: {
			type: String,
			value: null
		},
		cssUrl: {
			type: String,
			value: null
		},
		appRoot: {
			type: String,
			value: null
		},
		langAvailable: {
			type: Object,
			value: {}
		},
		langTag: {
			type: String,
			value: null
		},
		langDir: {
			type: String,
			value: null
		},
		imageToolsEnabled: {
			type: Number,
			value: 0
		},
		powerPasteEnabled: {
			type: Number,
			value: 0
		},
		powerPasteFormatting: {
			type: String,
			value: null
		},
		a11ycheckerEnabled: {
			type: Number,
			value: 0
		},
		allowUnsafe: {
			type: Boolean,
			value: false
		},
		fullpageEnabled: {
			type: Number,
			value: 1
		},
		autoFocusEnd: {
			type: Boolean,
			value: false
		},
		toolbar: {
			type: String,
			value: null
		},
		plugins: {
			type: String,
			value: null
		},
		defaultFullpageFontFamily: {
			type: String,
			value: null
		},
		defaultFullpageFontSize: {
			type: String,
			value: null
		},
		objectResizing: {
			type: Boolean,
			value: true
		},
		disabled: {
			type: Boolean,
			observer: '_disabledChanged'
		}
	},

	/**
	 * Textarea where tinymce is instantiate
	 * @return {HTMLElement}
	 */
	element: null,

	_disabledChanged: function(disabled) {
		if (disabled) {
			this.editor && this.editor.setMode('readonly');
		} else {
			this.editor && this.editor.setMode('design');
		}
	},

	client: function() {
		return window.ifrauclient ? window.ifrauclient : window.D2LHtmlEditor.client;
	},

	// Element Lifecycle
	registered: function() {
		// These links are intentionally added to the global document as we are assuming the
		// tinymce toolbars are not encapsulated by a shadow root. Historically this was true
		// for React based applications like QED that always use either an inline fixed_toolbar_container
		// or a target element in the light DOM of the HTML editor. For rubrics we are switching
		// to allowing tinymce to control the placement of the inline toolbar, as this gives better
		// support for toolbar positioning for tall/long edit controls.

		addLink('stylesheet', 'd2l-icons.css');
		addLink('stylesheet', 'd2l-equation-editor.css');
		addLink('stylesheet', 'd2l-placeholder.css');
		addLink('stylesheet', 'd2l-powerpaste-spinner.css');
		addLink('stylesheet', 'd2l-insertstuff.css');

		// This hocus pocus is to avoid the need for clients to have to explicitly add a script tag
		// to include tinymce.
		// TinyMCE uses the location of the script file to find other assets like themes and plugins.
		// It uses a couple of strategies to find the location of the script file including looking for
		// a script tag in the document and examining document.currentScript. Neither of these work
		// when tinymce is included using an es6 import with Polymer. However, it does have an undocumented
		// mechanism to use a `tinyMCEPreInit` object to set the base URL. So we are using that
		// here. However, to ensure this is set before the tinymce import is processed, we have to use a dynamic
		// import for tinymce. However using a dynamic import for tinymce also has the additional advantage
		// that we only load tinymce if a component on the page uses it. Otherwise if this component ends up
		// in shared polymer bundles, we would be loading tinymce even if the component wasn't used.
		const tinymceBaseUrl = 'https://s.brightspace.com/lib/tinymce/dev/4.8.5-a11ychecker.1.2.1-53-powerpaste.3.3.3-308-shadow-dom-fork-3';
		window.tinyMCEPreInit = {
			baseURL: tinymceBaseUrl,
			suffix: ''
		};

		const tinymceLoaded = import(tinymceBaseUrl + '/tinymce.min.js');

		var client = this.client()({
			syncFont: false,
			syncLang: false,
			resizeFrame: false,
			syncTitle: false
		});
		this.editorReady = Promise.all([client.connect(), tinymceLoaded]);
		this.ifrauClient = client;
	},

	ready: function() {
		// `ready` is called after all elements have been configured, but
		// propagates bottom-up. This element's children are ready, but parents
		// are not.
		//
		// This is the point where you should make modifications to the DOM (when
		// necessary), or kick off any processes the element wants to perform.
		// const $_iconsCss = document.createElement('link');
		// $_iconsCss.rel = 'stylesheet';
		// $_iconsCss.href = this.appRoot + '../d2l-html-editor/d2l-icons.css';
		// document.head.appendChild($_iconsCss);
	},

	attached: function() {
		// `attached` fires once the element and its parents have been inserted
		// into a document.
		//
		// This is a good place to perform any work related to your element's
		// visual state or active behavior (measuring sizes, beginning animations,
		// loading resources, etc).

		this.initialize();
		this.fire('d2l-html-editor-attached');
	},

	detached: function() {
		// The analog to `attached`, `detached` fires when the element has been
		// removed from a document.
		//
		// Use this to clean up anything you did in `attached`.
		this.cleanup();
	},

	_findValidLangTag: function() {
		var formattedLangTag = this._formatLangTag(this.langTag);
		var htmlLangAttr = this._formatLangTag(window.document.getElementsByTagName('html')[0].getAttribute('lang'));
		var htmlDefaultLangAttr = this._formatLangTag(window.document.getElementsByTagName('html')[0].getAttribute('data-lang-default'));

		if (this._checkIfLangExists(formattedLangTag)) {
			this.langTag = formattedLangTag;
		} else if (this._checkIfLangExists(htmlLangAttr)) {
			this.langTag = htmlLangAttr;
		} else if (this._checkIfLangExists(htmlDefaultLangAttr)) {
			this.langTag = htmlDefaultLangAttr;
		} else {
			this.langTag = 'en_US';
		}
	},

	//converts the d2l lang tag into a format that fits with tinyMCE lang files
	_formatLangTag: function(langTag) {
		if (langTag && langTag.indexOf('-') > -1) {
			var start = langTag.substring(0, 2);
			var lowerCaseEnd = langTag.substr(3);
			var upperCaseEnd = lowerCaseEnd.toUpperCase();
			return start + '_' + upperCaseEnd;
		}
		return langTag;
	},

	_checkIfLangExists: function(langTag) {
		if (langTag) {
			if (langTag in this.langAvailable) {
				return this.langAvailable[langTag];
			} else {
				var langExists = this._checkIfLangFileExists(langTag);
				this.langAvailable[langTag] = langExists;
				return langExists;
			}
		}
		return false;
	},

	_checkIfLangFileExists: function(langTag) {
		var url = this.appRoot + '../d2l-html-editor/langs/' + langTag + '.js?checkExists';
		var http = new XMLHttpRequest();
		http.open('HEAD', url, false);
		http.send();
		return Math.floor(http.status / 100) !== 4 && Math.floor(http.status / 100) !== 5;
	},

	_configurePlugins: function(client) {
		this.pluginConfig = {};

		var pluginsArr = this.plugins.split(' ');
		var pluginDefinitions = pluginsArr.map(function(plugin) {
			var pluginAlreadyLoaded = tinymce.PluginManager.get(plugin);
			if (pluginAlreadyLoaded) {
				return null;
			}
			var pluginBehavior = this._getPluginBehavior(plugin);
			return pluginBehavior ? pluginBehavior.plugin : null;
		}, this);

		var plugins = [];
		pluginDefinitions.forEach(function(plugin) {
			if (plugin) {
				plugins.push(plugin.addPlugin(client, this.pluginConfig));
			}
		}, this);
		return plugins;
	},

	_getPluginBehavior: function(plugin) {
		switch (plugin) {
			case 'd2l_attributes':
				return window.D2LHtmlEditor.PolymerBehaviors.Attributes;
			case 'd2l_preview':
				return window.D2LHtmlEditor.PolymerBehaviors.Preview;
			case 'd2l_image':
				return window.D2LHtmlEditor.PolymerBehaviors.Image;
			case 'd2l_isf':
				return window.D2LHtmlEditor.PolymerBehaviors.InsertStuff;
			case 'd2l_link':
				return window.D2LHtmlEditor.PolymerBehaviors.Link;
			case 'd2l_fullpage':
				return window.D2LHtmlEditor.PolymerBehaviors.Fullpage;
			case 'd2l_code':
				return window.D2LHtmlEditor.PolymerBehaviors.Code;
			case 'd2l_replacestring':
				return window.D2LHtmlEditor.PolymerBehaviors.ReplaceString;
			case 'd2l_formatrollup':
				return window.D2LHtmlEditor.PolymerBehaviors.FormatRollup;
			case 'd2l_textstylerollup':
				return window.D2LHtmlEditor.PolymerBehaviors.TextStyleRollup;
			case 'd2l_insertrollup':
				return window.D2LHtmlEditor.PolymerBehaviors.InsertRollup;
			case 'd2l_equation':
				return window.D2LHtmlEditor.PolymerBehaviors.EquationEditor;
			case 'd2l_xsplconverter':
				return window.D2LHtmlEditor.PolymerBehaviors.XsplConverter;
			case 'd2l_filter':
				return window.D2LHtmlEditor.PolymerBehaviors.Filter;
			case 'd2l_placeholder':
				return window.D2LHtmlEditor.PolymerBehaviors.Placeholder;
			case 'd2l_emoticons':
				return window.D2LHtmlEditor.PolymerBehaviors.Emoticons;
			case 'd2l_fontfamily':
				return window.D2LHtmlEditor.PolymerBehaviors.FontFamily;
			case 'autolink':
			case 'table':
			case 'fullscreen':
			case 'directionality':
			case 'hr':
			case 'textcolor':
			case 'colorpicker':
			case 'charmap':
			case 'link':
			case 'lists':
			case 'powerpaste':
			case 'paste':
			case 'a11ychecker':
			default:
				return null;
		}
	},

	_configureTinyMce: function(client) {
		var plugins = this._configurePlugins(client);
		return Promise.all(plugins);	// eslint-disable-line no-undef
	},

	_callService: function(client, serviceId, editor, fn) {
		client.getService(serviceId, '0.1').then(function(service) {
			fn.call(null, service, editor);
		});
	},

	_setDefaultToolbar: function() {
		if (this.inline) {
			this.toolbar = 'bold italic underline d2l_image d2l_isf d2l_equation fullscreen';
		} else {
			this.toolbar = 'bold italic underline d2l_textstylerollup | d2l_image d2l_isf d2l_link d2l_insertrollup | d2l_equation | bullist d2l_formatrollup | table | forecolor | styleselect | fontselect fontsizeselect | undo redo | d2l_code' + (this.a11ycheckerEnabled ? ' a11ycheck' : '') + ' d2l_preview | smallscreen';
		}
	},

	_setDefaultPlugins: function() {
		this.plugins = 'd2l_attributes d2l_preview d2l_image d2l_isf d2l_link d2l_emoticons d2l_fontfamily ' + (this.fullpageEnabled ? 'd2l_fullpage ' : '') + 'autolink table fullscreen directionality hr textcolor colorpicker d2l_code d2l_replacestring charmap link lists d2l_formatrollup d2l_textstylerollup d2l_insertrollup d2l_equation d2l_xsplconverter d2l_filter d2l_placeholder' + (this.powerPasteEnabled ? ' powerpaste' : ' paste') + (this.a11ycheckerEnabled ? ' a11ychecker' : '');
	},

	initialize: function() {
		var that = this;
		if (this.toolbar === null) {
			this._setDefaultToolbar();
		}
		if (this.plugins === null) {
			this._setDefaultPlugins();
		}

		this.editorReady.then(function() {
			that._configureTinyMce(that.ifrauClient).then(function() {
				that.ifrauClient.request('valenceHost').then(function(valenceHost) {
					that._init(valenceHost);
				});
			});
		});
	},

	// We cannot cleanup in detached because React seems to cause the web component
	// to detach/attach during move operations
	cleanup: function() {
		var editor = tinymce.EditorManager.get(this.editorId);
		if (editor) {
		// prevent save before remove, since it throws an exception when the HTML content contains a table
			editor.save = function() {};
			editor.remove();
		}
		this.client = null;
		this.element.removeEventListener('focusin', this._focusInHandler);
	},

	focus: function() {
		tinymce.EditorManager.get(this.editorId).focus();
	},

	getContent: function(args) {
		return tinymce.EditorManager.get(this.editorId).getContent(args);
	},

	clearContent: function() {
		tinymce.EditorManager.get(this.editorId).setContent('');
	},

	_keyChanged: function(newKey, oldKey) {
		// Only process key change events where we have an old key meaning
		// the editor is being re-rendered with different data - usually in a dom-repeat.
		// If we don't have an old key then this is an initial render and we let the
		// default initialization mechanism do it's thing.
		if (!oldKey) {
			return;
		}

		afterNextRender(this, function() {
			var editor = tinymce.EditorManager.get(this.editorId);
			if (editor) {
				var decodedContent = decodeURIComponent(this.content);
				editor.setContent(decodedContent);
			}
		}.bind(this));
	},

	_d2lPluginSettingsChanged: function(pluginSettings) {
		if (this.ifrauClient.configureSettings) {
			this.ifrauClient.configureSettings(pluginSettings);
		}
	},

	_init: function(valenceHost) {
		if (null !== this.baseUrl) {
			tinyMCE.baseURL = this.baseUrl; // eslint-disable-line
		}

		this.element = this.querySelector('#' + this.editorId);
		this.element.style.overflowY = 'auto';
		this.element.style.minHeight = this.minHeight;
		this.element.style.maxHeight = this.maxHeight;
		this.element.addEventListener('focusin', this._focusInHandler);

		this._initTinyMCE(valenceHost);
	},

	// This handler is required to prevent issues in IE11 where the toolbar
	// is shown and then immediately hidden again when an editor gains focus. It occurs because
	// tinymce registers a document level 'focus' listener to hide the toolbar when the
	// document gets focus outside the editor. For browsers that don't
	// support document.documentElement.onFocusIn, it uses a 'focus' event in 'capture'
	// phase. This seems to be most desktop browsers (Edge, FF, Chrome) even though they
	// do support the 'focusin' event. However, for IE11 it does use 'focusin'. In contrast
	// to 'focus', 'focusin' bubbles, so after the editor gets focus the document level
	// handler fires. Tinymce contains code to try and determine if the target event is related
	// to the editor. Pre-Polymer 2 this worked for IE11, because event retargetting was not
	// simulated for shady DOM. However, since Polymer 2, it looks like event retargetting
	// is implemented by the polyfills. So when the document level handler gets the event
	// it appears to have come from the top level web component in the document that
	// encapsulates the editor, and so the handler thinks the editor lost focus, and so
	// immediately hides the toolbar again. Stopping propagation for this event when
	// it does come from the editor doesn't seem to have any side effects and works around
	// the issue.
	_focusInHandler: function(e) {
		e.stopPropagation();
	},

	_extend: function(obj, target) {
		for (var i in obj) {
			if (obj.hasOwnProperty(i) && !target.hasOwnProperty(i)) {
				target[i] = obj[i];
			}
		}
		return target;
	},

	_initTinyMCE: function(valenceHost) {
		var that = this;

		this._findValidLangTag();

		var contentCss = '';
		if (!this.inline) {
			contentCss += this.cssUrl + ',';
			contentCss += this.appRoot + '../d2l-html-editor/d2l-insertstuff.css' + ',' + this.appRoot + '../d2l-html-editor/d2l-equation-editor.css' + ',' + this.appRoot + '../d2l-html-editor/d2l-placeholder.css';
		}

		var updateImageUploadSpinners = function() {
			if (!tinymce.activeEditor) {
				return;
			}
			var body = tinymce.activeEditor.getBody();
			var images = body.getElementsByTagName('img');
			var imageSpinnersDiv = body.querySelector('#d2l-html-editor-image-upload-spinners');
			if (imageSpinnersDiv) {
				imageSpinnersDiv.parentNode.removeChild(imageSpinnersDiv);
				imageSpinnersDiv = null;
			}

			for (var i = 0; i < images.length; i++) {
				if (images[i].src.indexOf('blob:') === 0
					&& !images[i].getAttribute('data-mce-selected')	 // if an image is selected in this state it's usually being manipulated by image tools plugin
				) {
					images[i].setAttribute('data-mce-bogus', 'all');
					var img = images[i];
					var width = img.clientWidth;
					var height = img.clientHeight;
					var x = img.offsetLeft;
					var y = img.offsetTop;
					var minDim = Math.min(width, height);
					minDim = Math.min(69, minDim);
					var html = images[i].outerHTML;

					html = '<div data-mce-bogus="all" style="position:absolute;user-select:none;top:' + y + 'px;left:' + x + 'px;height:' + height + 'px;width:' + width + 'px;">' +
						'<div data-mce-bogus="all" class="powerpaste-spinner-shim" ></div>' +
						'<div data-mce-bogus="all" class="powerpaste-spinner-bg" style="font-size:' + minDim / 2 + 'px;'
						+ 'top:' + (height / 2 - minDim / 2) + 'px;'
						+ 'left:' + (width / 2 - minDim / 2) + 'px">' +
						'<div data-mce-bogus="all" class="powerpaste-spinner-slice1">&nbsp;</div><div class="powerpaste-spinner-slice2">&nbsp;</div><div class="powerpaste-spinner-slice3">&nbsp;</div><div class="powerpaste-spinner-slice4">&nbsp;</div><div class="powerpaste-spinner-slice5">&nbsp;</div>' +
						'</div></div>';
					var div = document.createElement('div');
					div.innerHTML = html;
					div.setAttribute('data-mce-bogus', 'all');

					if (!imageSpinnersDiv) {
						imageSpinnersDiv = document.createElement('div');
						imageSpinnersDiv.setAttribute('data-mce-bogus', 'all');
						imageSpinnersDiv.setAttribute('id', 'd2l-html-editor-image-upload-spinners');
						body.appendChild(imageSpinnersDiv);
					}

					imageSpinnersDiv.appendChild(div);
					imageSpinnersDiv = div;
				}
				else {
					images[i].removeAttribute('data-mce-bogus');
				}
			}
		};

		var config = {
			d2l_html_editor: that,
			target: this.element,
			external_plugins: this.langTag && this.langTag !== 'en_US' && this.langAvailable[this.langTag] ? {'d2l_lang': this.appRoot + '../d2l-html-editor/d2l_lang_plugin/d2l-lang-plugin.js'} : null,
			plugins: this.plugins,
			toolbar: this.toolbar,
			fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
			fullpage_default_font_family: this.defaultFullpageFontFamily,
			fullpage_default_font_size: this.defaultFullpageFontSize,
			style_formats: [
				{title: 'Paragraph', format: 'p'},
				{title: 'Address', format: 'address'},
				{title: 'Preformatted', format: 'pre'},
				{title: 'Header 1', format: 'h1'},
				{title: 'Header 2', format: 'h2'},
				{title: 'Header 3', format: 'h3'},
				{title: 'Header 4', format: 'h4'},
				{title: 'Header 5', format: 'h5'},
				{title: 'Header 6', format: 'h6'}
			],
			auto_focus: this.autoFocus ? this.editorId : null,
			browser_spellcheck: true,
			menubar: false,
			statusbar: false,
			fixed_toolbar_container: '#' + this.toolbarId,
			inline: this.inline ? true : false,
			allow_html_in_named_anchor: true,
			document_base_url: this.documentBaseUrl + '/',
			content_css: contentCss,
			skin_url: this.appRoot + '../d2l-html-editor/skin-4.3.7',
			convert_urls: false,
			relative_urls: false,
			language_url: this.langTag && this.langAvailable[this.langTag] ? this.appRoot + '../d2l-html-editor/langs/' + this.langTag + '.js' : null,
			language: this.langTag && this.langAvailable[this.langTag] ? this.langTag : null,
			directionality: this.langDir,
			object_resizing: this.objectResizing,
			powerpaste_word_import: this.powerPasteFormatting,
			powerpaste_allow_local_images: this.powerPasteEnabled ? true : false,
			powerpaste_block_drop : false,
			paste_as_text: this.powerPasteEnabled ? false : true,
			paste_text_sticky: this.powerPasteEnabled ? false : true,
			paste_preprocess: function(plugin, args) {
				if (!that.powerPasteEnabled) {
					// Stops Paste plugin from converting pasted image links to image
					args.content += ' ';
				}
			},
			images_upload_handler: function(blobInfo, replaceImageUrlFunction) {
				var blob = blobInfo.blob();
				var filename = blobInfo.filename();

				var successCallback = function(newUrl) {
					replaceImageUrlFunction(newUrl);
					setTimeout(updateImageUploadSpinners, 1);	// need to wait one frame for the urls to be updated before we get rid of the image spinners
				};
				var failCallBack = function() {
					// fail, but we make the url invalid so the user knows something went wrong
					successCallback('pasteFailed');
				};

				that.fire('d2l-html-editor-image-upload-started');
				var formData = new FormData();
				formData.append('file', blob, filename);
				window.d2lfetch.fetch(valenceHost + '/d2l/api/le/unstable/file/AddTempFile', {
					method: 'POST',
					body: formData
				}).then(function(response) {
					if (response.ok) {
						return response.body();
					} else {
						failCallBack();
					}
				}).then(function(body) {
					successCallback(body);
				}).catch(function() {
					failCallBack();
				}).finally(function() {
					that.fire('change', {content: that.editor.getContent()});
					that.fire('d2l-html-editor-image-upload-completed');
				});
			},
			setup: function(editor) {
				that.editor = editor;
				function translateAccessibility(node) {
					if (node.nodeType === 1) {

						if (node.hasAttribute('aria-label')) {
							node.setAttribute('aria-label', tinymce.EditorManager.i18n.translate(node.getAttribute('aria-label')));
						}

						if (node.hasAttribute('alt')) {
							node.setAttribute('alt', tinymce.EditorManager.i18n.translate(node.getAttribute('alt')));
						}

						node = node.firstElementChild;
						while (node) {
							translateAccessibility(node, editor);
							node = node.nextSibling;
						}
					}
				}

				function passEditorIdTranslate(editorId) {
					var editorStartNode = document.querySelector('d2l-html-editor[editor-id="' + editorId + '"]');
					if (editorStartNode) {
						translateAccessibility(editorStartNode);
					}
				}

				function fixButtonLabels(editor) {
					var editorElement = document.getElementById(editor.id);
					if (!editorElement) {
						return;
					}

					var cont = document.getElementById(editor.id).parentElement;

					var btnDivs = cont.getElementsByClassName('mce-btn');
					var length = btnDivs ? btnDivs.length : -1;
					for (var i = 0; i < length; i ++) {
						btnDivs[i].removeAttribute('aria-labelledby');
					}
				}

				function findTables(editor) {
					if (!document.getElementById(editor.id)) {
						return;
					}
					var tables;
					var cont = document.getElementById(editor.id).parentElement;
					var iframes = cont.getElementsByTagName('iframe');
					if (iframes.length > 0) {
						for (var i = 0; i < iframes.length; i++) {
							try {
								tables = iframes[i].contentDocument.getElementsByTagName('table');
								updateTableAttributes(tables);
							} catch (e) {
								/*This is being left empty, as we don't want to pollute the console log, and don't currently have a means of keeping track of logged exceptions.
								This try-catch was needed to catch exceptions related to attempting to check the contentDocument of cross-origin iframes, which was a problem
								in the non full-screen question editor text areas (specifically as a result of issues with Kaltura videos).*/
							}
						}
					} else {
						tables = cont.getElementsByTagName('table');
						updateTableAttributes(tables);
					}
				}

				function updateTableAttributes(tables) {
					var attributeValue, tableBorder;
					var length = tables ? tables.length : -1;
					for (var i = 0; i < length; i ++) {
						attributeValue = tables[i].getAttribute('style');
						tableBorder = parseFloat(tables[i].getAttribute('border'));
						if (isNaN(tableBorder) && attributeValue && attributeValue.indexOf('border-color') > -1) {
							tables[i].setAttribute('border', 1);
							tables[i].setAttribute('class', '');
						} else if (tableBorder < 0) {
							tables[i].setAttribute('border', 0);
							tables[i].setAttribute('class', 'mce-item-table');
						}
						attributeValue = tables[i].getAttribute('data-mce-style');
						tableBorder = parseFloat(tables[i].getAttribute('border'));
						if (!(isNaN(tableBorder) || tableBorder === 0) && attributeValue && attributeValue.indexOf('border-style: solid;') === -1) {
							tables[i].setAttribute('data-mce-style', attributeValue + 'border-style: solid;');
						} else if (tableBorder === 0 && attributeValue && attributeValue.indexOf('border-style: solid;') > -1) {
							attributeValue = attributeValue.replace('border-style: solid;', '');
							tables[i].setAttribute('data-mce-style', attributeValue);
						}
					}
				}

				editor.on('setcontent', function(event) {
					findTables(editor);

					// The content of the first setcontent event is always "",
					// if there is content to be set, it will be in the second setcontent event
					if (event.content && config.auto_focus && that.autoFocusEnd) {
						// Set cursor to end of input
						editor.focus();
						editor.selection.select(editor.getBody(), true);
						editor.selection.collapse(false);
						that.autoFocusEnd = false;
					}
				});

				editor.on('change redo undo', function() {
					updateImageUploadSpinners();
					findTables(editor);
					that.fire('change', {content: editor.getContent()});
				});

				editor.on('focusin', function(e) {
					that.fire('focus', e);
					// give time for buttons to load
					setTimeout(function() {
						fixButtonLabels(editor);
					}, 2000);
				});

				editor.on('focusout', function(e) {
					that.fire('blur', e);
				});

				editor.on('keyup', function() {
					// that.element.value = editor.getContent();
				});

				editor.addButton('fullscreen', {
					title: 'Open in Full Screen Editor',
					icon: 'd2l_fullscreen',
					onclick: function() {
						that.fire('fullscreen');
					},
					onPostRender: function() {
						passEditorIdTranslate(that.editorId);
					}
				});

				editor.addButton('smallscreen', {
					title: 'Close Full Screen Editor',
					icon: 'd2l_smallscreen',
					onclick: function() {
						editor.execCommand('mceFullScreen');
						that.fire('restore');
					},
					onPostRender: function() {
						passEditorIdTranslate(that.editorId);
					}
				});

				if (!this.inline) {
					editor.on('init', function() {
						editor.execCommand('mceFullScreen');
						editor.getBody().setAttribute('aria-label', tinymce.EditorManager.i18n.translate('Press ALT-F10 for toolbar, and press ESC to exit toolbar once inside'));
						var container = editor.getContainer();
						var langTag = container.parentElement.getAttribute('lang-tag');
						editor.getDoc().querySelector('html').setAttribute('lang', langTag ? langTag : 'en-us');

						var titleNode = document.createElement('title');
						var textNode = document.createTextNode(tinymce.EditorManager.i18n.translate('Press ALT-F10 for toolbar, and press ESC to exit toolbar once inside'));
						titleNode.appendChild(textNode);

						var headElement = editor.getDoc().querySelector('head');
						headElement.appendChild(titleNode);

						var btns = container.querySelectorAll('.mce-colorbutton > button');
						var length = btns ? btns.length : -1;
						for (var i = 0; i < length; i ++) {
							btns[i].setAttribute('role', 'presentation');
						}
					});
				}
			}
		};

		if (this.allowUnsafe) {
			config.valid_elements = '*[*]';
		} else {
			config.extended_valid_elements = 'span[*]';
		}

		if (this.imageToolsEnabled) {
			config.plugins += ' image imagetools';
			if (valenceHost) {
				// get the root domain name of the valence host
				var matches = valenceHost.toLowerCase().match(/^https?:\/\/([^/:?#]+)(?:[/:?#]|$)/i);
				var domainName = matches && matches[1];
				if (domainName) {
					config.imagetools_cors_hosts = [domainName];
					config.imagetools_credentials_hosts = [domainName];
				}
			}
		}

		tinymce.init(this._extend(this.pluginConfig, config));

		// need to reset auto focus property to prevent unwanted focus during re-ordering of the options
		this.autoFocus = 0;
	},

	computeToolbarId: function(editorId) {
		return editorId + '-toolbar';
	},

	computeHeight: function(totalPadding, rows, lineHeight) {
		return totalPadding + (lineHeight * rows) + 'rem';
	}
});
