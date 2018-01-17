var superagent_auth = require('superagent-d2l-session-auth');
var superagent= require('superagent');


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
		window.D2LHtmlEditor.PolymerBehaviors.Filter,
		window.D2LHtmlEditor.PolymerBehaviors.Placeholder,
		window.D2LHtmlEditor.PolymerBehaviors.Fullpage
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
		this.ifrauClient = client;
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

	_checkIfLangExists: function(url) {
		var http = new XMLHttpRequest();
		http.open('HEAD', url, false);
		http.send();
		if (Math.floor(http.status / 100) !== 4 && Math.floor(http.status / 100) !== 5) {
			this.langAvailable.bool = true;
		} else {
			this.langAvailable.bool = false;
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
		var that = this;
		this.editorReady.then(function() {
			that.ifrauClient.request('valenceHost').then( function(valenceHost){
				that._init(valenceHost);
			});
		}.bind(this));
	},

	// We cannot cleanup in detached because React seems to cause the web component
	// to detach/attach during move operations
	cleanup: function() {
		var editor = tinymce.EditorManager.get(this.editorId);

		// prevent save before remove, since it throws an exception when the HTML content contains a table
		editor.save = function(){};
		editor.remove();

		this.client = null;
	},

	focus: function() {
		tinymce.EditorManager.get(this.editorId).focus(); // eslint-disable-line no-undef
	},

	getContent: function(args) {
		return tinymce.EditorManager.get(this.editorId).getContent(args); // eslint-disable-line no-undef
	},

	_init: function(valenceHost ) {
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

		this._initTinyMCE(valenceHost);
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

		if (this.langAvailable.bool === undefined || this.langAvailable.bool === null) {
			this._checkIfLangExists(this.appRoot + '../d2l-html-editor/langs/' + this.langTag + '.js');
		}
		var contentCss = this.inline ? '' : this.cssUrl + ',';
		contentCss += this.appRoot + '../d2l-html-editor/d2l-insertstuff.css' + ',' + this.appRoot + '../d2l-html-editor/d2l-equation-editor.css' + ',' + this.appRoot + '../d2l-html-editor/d2l-placeholder.css';


		var updateImageUploadSpinners=function(){
			if (!tinymce.activeEditor){
				return;
			}
			var body = tinymce.activeEditor.getBody();
			var images = body.getElementsByTagName('img');
			var imageSpinnersDiv = body.querySelector("#d2l-html-editor-image-upload-spinners");
			if ( imageSpinnersDiv ){
				imageSpinnersDiv.parentNode.removeChild(imageSpinnersDiv);
				imageSpinnersDiv = null;
			}

			for ( var i=0; i < images.length; i++ ){
				if ( images[i].src.startsWith("blob:") 
				&& !images[i].getAttribute("data-mce-selected") 	// if an image is selected in this state it's usually being manipulated by image tools plugin
				){
					images[i].setAttribute("data-mce-bogus","all");
					var img = images[i];
					var width = img.clientWidth;
					var height = img.clientHeight;
					var x = img.offsetLeft;
					var y = img.offsetTop;
					var minDim = Math.min(width,height);
					minDim = Math.min(69,minDim);
					var html = images[i].outerHTML;

					html = '<div data-mce-bogus="all" style="position:absolute;user-select:none;top:' + y + 'px;left:'+x+'px;height:' + height + 'px;width:'+ width+'px;">' +
						'<div data-mce-bogus="all" class="powerpaste-spinner-shim" ></div>' +
						'<div data-mce-bogus="all" class="powerpaste-spinner-bg" style="font-size:' + minDim/2 + 'px;'
						+ 'top:'+ (height/2-minDim/2) + 'px;'
						+ 'left:' + (width/2-minDim/2) + 'px">' +
						'<div data-mce-bogus="all" class="powerpaste-spinner-slice1">&nbsp;</div><div class="powerpaste-spinner-slice2">&nbsp;</div><div class="powerpaste-spinner-slice3">&nbsp;</div><div class="powerpaste-spinner-slice4">&nbsp;</div><div class="powerpaste-spinner-slice5">&nbsp;</div>'+
						'</div></div>';
					var div = document.createElement('div');
					div.innerHTML = html;
					div.setAttribute("data-mce-bogus","all");

					if ( !imageSpinnersDiv ){
						imageSpinnersDiv = document.createElement('div');
						imageSpinnersDiv.setAttribute("data-mce-bogus","all");
						imageSpinnersDiv.setAttribute("id","d2l-html-editor-image-upload-spinners")
						body.appendChild(imageSpinnersDiv);
					}

					imageSpinnersDiv.appendChild(div);
					imageSpinnersDiv = div;
				}
				else {
					images[i].removeAttribute("data-mce-bogus");
				}
			}
		};
		

		var config = {
			d2l_html_editor: that,
			selector: '#' + this.editorId,

			external_plugins: this.langTag && this.langTag !== 'en_US' && this.langAvailable.bool ? {'d2l_lang': this.appRoot + '../d2l-html-editor/d2l_lang_plugin/d2l-lang-plugin.js'} : null,
			plugins: 'd2l_attributes d2l_preview d2l_image d2l_isf d2l_link ' + (this.fullpageEnabled ? 'd2l_fullpage ' : '') + 'autolink table fullscreen directionality hr textcolor colorpicker d2l_code d2l_replacestring charmap link lists d2l_formatrollup d2l_textstylerollup d2l_insertrollup d2l_equation d2l_xsplconverter d2l_filter d2l_placeholder' + (this.powerPasteEnabled?' powerpaste':'') + (this.a11ycheckerEnabled?' a11ychecker':''),
			toolbar: this.inline ? 'bold italic underline d2l_image d2l_isf d2l_equation fullscreen' : 'bold italic underline d2l_textstylerollup | d2l_image d2l_isf d2l_link d2l_insertrollup | d2l_equation | bullist d2l_formatrollup | table | forecolor | styleselect | fontselect fontsizeselect | undo redo | d2l_code' + (this.a11ycheckerEnabled?' a11ycheck':'') + ' d2l_preview | smallscreen',
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
			extended_valid_elements: 'span[*]' + this.allowUnsafe ? ',script[type|src]' : '',
			document_base_url: this.documentBaseUrl + '/',
			content_css: contentCss,
			skin_url: this.appRoot + '../d2l-html-editor/skin-4.3.7',
			convert_urls: false,
			relative_urls: false,
			language_url: this.langTag && this.langAvailable.bool ? this.appRoot + '../d2l-html-editor/langs/' + this.langTag + '.js' : null,
			language: this.langTag && this.langAvailable.bool ? this.langTag : null,
			directionality: this.langDir,
			powerpaste_word_import: this.powerPasteFormatting,
			powerpaste_allow_local_images: true,
			powerpaste_block_drop : false,
			images_upload_handler: function(blobInfo, replaceImageUrlFunction){
				var blob = blobInfo.blob();
				var filename = blobInfo.filename();
				var client = that.ifrauClient;

				var successCallback = function(newUrl ){
					replaceImageUrlFunction(newUrl);
					setTimeout(updateImageUploadSpinners,1);	// need to wait one frame for the urls to be updated before we get rid of the image spinners
				}
				var failCallBack = function(){
					// fail, but we make the url invalid so the user knows something went wrong
					successCallback("pasteFailed");
				}
				function getHost(baseUrl) {
					var host = /https?:\/\/([^\/]+).*/.exec(baseUrl)[1];
					return host;
				}
				that.fire("d2l-html-editor-image-upload-started");
				superagent.post(valenceHost + '/d2l/api/le/unstable/file/AddTempFile')
					.use(superagent_auth({trustedHost: getHost(valenceHost)}))
					.attach('file',blob,filename)
					.end( function(error,response){
						if ( !error ){
							successCallback(response.body);
						}
						else{
							failCallBack();
						}
						that.fire('change', {content: that.editor.getContent()});
						that.fire("d2l-html-editor-image-upload-completed");
					});
			},
			setup: function(editor) {
				that.editor = editor;
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

				function fixButtonLabels(editor) {
					var editorElement = document.getElementById(editor.id);
					if (!editorElement) {
						return;
					}

					var cont = document.getElementById(editor.id).parentElement;

					var btnDivs = cont.getElementsByClassName('mce-btn');
					length = btnDivs ? btnDivs.length : -1;
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
					length = tables ? tables.length : -1;
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

				editor.on('setcontent', function() {
					findTables(editor);
				});

				editor.on('change redo undo', function( event ) {
					updateImageUploadSpinners();
					findTables(editor);
					that.fire('change', {content: editor.getContent()});
				});

				editor.on('focusin', function(e) {
					that.fire('focus', e);
					setTimeout(fixButtonLabels, 2000, editor);  // give time for buttons to load
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
						editor.getBody().setAttribute('aria-label', tinymce.EditorManager.i18n.translate('Press ALT-F10 for toolbar, and press ESC to exit toolbar once inside')); // eslint-disable-line no-undef
						var container = editor.getContainer();
						var langTag = container.parentElement.getAttribute('lang-tag');
						editor.getDoc().querySelector('html').setAttribute('lang', langTag ? langTag : 'en-us');

						var titleNode = document.createElement('title');
						var textNode = document.createTextNode(tinymce.EditorManager.i18n.translate('Press ALT-F10 for toolbar, and press ESC to exit toolbar once inside')); // eslint-disable-line no-undef
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

		if ( this.imageToolsEnabled ){
			config.plugins += ' image imagetools';
			if ( valenceHost ){
				// get the root domain name of the valence host
				var domainName = valenceHost.toLowerCase().replace("http://","").replace("https://","");
				// strip the port number if it exists
				var indexOfColon = domainName.indexOf(":");
				if ( indexOfColon !== -1 ){
					domainName =  domainName.substring(0,indexOfColon);
				}
				config.imagetools_cors_hosts = [domainName];
			}
		}

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
