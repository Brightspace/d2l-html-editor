Polymer({

	is: 'd2l-html-editor',

	behaviors: [
		window.D2LHtmlEditor.PolymerBehaviors.InsertStuff,
		window.D2LHtmlEditor.PolymerBehaviors.Image,
		window.D2LHtmlEditor.PolymerBehaviors.Link,
		window.D2LHtmlEditor.PolymerBehaviors.TextStyleRollup,
		window.D2LHtmlEditor.PolymerBehaviors.FormatRollup,
		window.D2LHtmlEditor.PolymerBehaviors.InsertRollup,
		window.D2LHtmlEditor.PolymerBehaviors.EquationEditor,
		window.D2LHtmlEditor.PolymerBehaviors.Code,
		window.D2LHtmlEditor.PolymerBehaviors.ReplaceString,
		window.D2LHtmlEditor.PolymerBehaviors.FontFamily,
		window.D2LHtmlEditor.PolymerBehaviors.Attributes,
		window.D2LHtmlEditor.PolymerBehaviors.Preview,
		window.D2LHtmlEditor.PolymerBehaviors.XsplConverter,
		window.D2LHtmlEditor.PolymerBehaviors.Filter
	],

	/**
	 * @see tinymce config
	 */
	properties: {
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
		content: String,
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
		langTag: {
			type: String,
			value: null
		},
		langDir: {
			type: String,
			value: null
		}
	},

	/**
	 * Textarea where tinymce is instantiate
	 * @return {HTMLElement}
	 */
	element: null,

	// Element Lifecycle
	registered: function() {
		var client = window.ifrauclient({
			syncFont: false,
			syncLang: false,
			resizeFrame: false
		});
		this.editorReady = client.connect().then(function() {
			return this._configureTinyMce(client);
		}.bind(this));
	},

	ready: function() {
		// `ready` is called after all elements have been configured, but
		// propagates bottom-up. This element's children are ready, but parents
		// are not.
		//
		// This is the point where you should make modifications to the DOM (when
		// necessary), or kick off any processes the element wants to perform.
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

	//converts the d2l lang tag into a format that fits with tinyMCE lang files
	_changeLangTag: function() {
		if (this.langTag.indexOf('-') > -1) {
			var start = this.langTag.substring(0, 2);
			var lowerCaseEnd = this.langTag.substr(3);
			var upperCaseEnd = lowerCaseEnd.toUpperCase();
			this.langTag = start + '_' + upperCaseEnd;
		}
	},

	_configurePlugins: function(client) {
		this.pluginConfig = {};

		var pluginDefinitions = this.behaviors.map(function(behavior) {
			return behavior.plugin;
		});

		var plugins = [];
		pluginDefinitions.forEach(function(plugin) {
			if (plugin) {
				plugins.push(plugin.addPlugin(client, this.pluginConfig));
			}
		}, this);
		return plugins;
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

	initialize: function() {
		this.editorReady.then(function() {
			this._init();
		}.bind(this));
	},

	// We cannot cleanup in detached because React seems to cause the web component
	// to detach/attach during move operations
	cleanup: function() {
		tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.editorId); // eslint-disable-line no-undef
		this.client = null;
	},

	focus: function() {
		tinymce.EditorManager.get(this.editorId).focus(); // eslint-disable-line no-undef
	},

	getContent: function(args) {
		return tinymce.EditorManager.get(this.editorId).getContent(args); // eslint-disable-line no-undef
	},

	_init: function() {
		if (null !== this.baseUrl) {
			tinyMCE.baseURL = this.baseUrl; // eslint-disable-line
		}

		// In React 15 Polymer dom APIs for distributed light DOM children
		// seem to be broken - this will probably not work in Shadow DOM
		// this.element = Polymer.dom(this).querySelector('#' + this.editorId);
		this.element = this.querySelector('#' + this.editorId);
		this.element.style.overflowY = 'auto';
		this.element.style.minHeight = this.minHeight;
		this.element.style.maxHeight = this.maxHeight;
		this._changeLangTag();

		this._initTinyMCE();
	},

	_extend: function(obj, target) {
		for (var i in obj) {
			if (obj.hasOwnProperty(i) && !target.hasOwnProperty(i)) {
				target[i] = obj[i];
			}
		}
		return target;
	},

	_initTinyMCE: function() {
		var that = this;
		var contentCss = this.inline ? '' : this.cssUrl + ',';
		contentCss += this.appRoot + '../d2l-html-editor/d2l-insertstuff.css' + ',' + this.appRoot + '../d2l-html-editor/d2l-equation-editor.css';
		var config = {
			d2l_html_editor: that,
			selector: '#' + this.editorId,
			external_plugins: this.langTag && this.langTag !== 'en_US' ? {'d2l_lang': this.appRoot + '../d2l-html-editor/d2l_lang_plugin/d2l-lang-plugin.js'} : null,
			plugins: 'd2l_attributes d2l_preview d2l_image d2l_isf d2l_link autolink table fullscreen directionality hr textcolor colorpicker d2l_code d2l_replacestring charmap link lists d2l_formatrollup d2l_textstylerollup d2l_insertrollup d2l_equation d2l_xsplconverter d2l_filter',
			toolbar: this.inline ? 'bold italic underline d2l_image d2l_isf d2l_equation fullscreen' : 'bold italic underline d2l_textstylerollup | d2l_image d2l_isf d2l_link d2l_insertrollup | d2l_equation | bullist d2l_formatrollup | table | forecolor | styleselect | fontselect fontsizeselect | undo redo | d2l_code d2l_preview | smallscreen',
			fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
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
			document_base_url: this.documentBaseUrl + '/',
			content_css: contentCss,
			skin_url: this.appRoot + '../d2l-html-editor/skin-4.3.7',
			convert_urls: false,
			relative_urls: false,
			language_url: this.langTag ? this.appRoot + '../d2l-html-editor/langs/' + this.langTag + '.js' : null,
			language: this.langTag ? this.langTag : null,
			directionality: this.langDir,
			setup: function(editor) {

				function translateAccessibility(node) {
					if (node.nodeType === 1) {

						if (node.hasAttribute('aria-label')) {
							node.setAttribute('aria-label', tinymce.EditorManager.i18n.translate(node.getAttribute('aria-label'))); // eslint-disable-line no-undef
						}

						if (node.hasAttribute('alt')) {
							node.setAttribute('alt', tinymce.EditorManager.i18n.translate(node.getAttribute('alt'))); // eslint-disable-line no-undef
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

				editor.on('change', function() {
					that.fire('change', {content: editor.getContent()});
				});

				editor.on('focusin', function(e) {
					that.fire('focus', e);
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
						editor.getBody().setAttribute('aria-label', 'Press ALT-F10 for toolbar, and press ESC to exit toolbar once inside');
					});
				}
			}
		};

		tinymce.init(this._extend(this.pluginConfig, config)); // eslint-disable-line no-undef

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

