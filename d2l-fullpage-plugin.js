import './d2l-html-editor-plugin.js';
/*global tinymce:true */
/** @polymerBehavior */
var FullpageBehavior = {
	plugin: {
		addPlugin: function() {
			tinymce.PluginManager.add('d2l_fullpage', function(editor) {

				var each = tinymce.each, Node = tinymce.html.Node;
				var head, foot;

				function showDialog() {
					var data = htmlToData();

					editor.windowManager.open({
						title: 'Document properties',
						data: data,
						defaults: { type: 'textbox', size: 40 },
						body: [
							{ name: 'title', label: 'Title' },
							{ name: 'keywords', label: 'Keywords' },
							{ name: 'description', label: 'Description' },
							{ name: 'robots', label: 'Robots' },
							{ name: 'author', label: 'Author' },
							{ name: 'docencoding', label: 'Encoding' }
						],
						onSubmit: function(e) {
							dataToHtml(tinymce.extend(data, e.data));
						}
					});
				}

				function htmlToData() {
					var headerFragment = parseHeader(), data = {}, elm, matches;

					function getAttr(elm, name) {
						var value = elm.attr(name);

						return value || '';
					}

					// Default some values
					data.fontface = editor.getParam('fullpage_default_font_family', '');
					data.fontsize = editor.getParam('fullpage_default_font_size', '');

					// Parse XML PI
					elm = headerFragment.firstChild;
					if (elm.type === 7) {
						data.xml_pi = true;
						matches = /encoding="([^"]+)"/.exec(elm.value);
						if (matches) {
							data.docencoding = matches[1];
						}
					}

					// Parse doctype
					elm = headerFragment.getAll('#doctype')[0];
					if (elm) {
						data.doctype = '<!DOCTYPE' + elm.value + '>';
					}

					// Parse title element
					elm = headerFragment.getAll('title')[0];
					if (elm && elm.firstChild) {
						data.title = elm.firstChild.value;
					}

					// Parse meta elements
					each(headerFragment.getAll('meta'), function(meta) {
						var name = meta.attr('name'), httpEquiv = meta.attr('http-equiv'), matches;

						if (name) {
							data[name.toLowerCase()] = meta.attr('content');
						} else if (httpEquiv === 'Content-Type') {
							matches = /charset\s*=\s*(.*)\s*/gi.exec(meta.attr('content'));

							if (matches) {
								data.docencoding = matches[1];
							}
						}
					});

					// Parse html attribs
					elm = headerFragment.getAll('html')[0];
					if (elm) {
						data.langcode = getAttr(elm, 'lang') || getAttr(elm, 'xml:lang');
					}

					// Parse stylesheet
					elm = headerFragment.getAll('link')[0];
					if (elm && elm.attr('rel') === 'stylesheet') {
						data.stylesheet = elm.attr('href');
					}

					// Parse body parts
					elm = headerFragment.getAll('body')[0];
					if (elm) {
						data.langdir = getAttr(elm, 'dir');
						data.style = getAttr(elm, 'style');
						data.visited_color = getAttr(elm, 'vlink');
						data.link_color = getAttr(elm, 'link');
						data.active_color = getAttr(elm, 'alink');
					}

					return data;
				}

				function dataToHtml(data) {
					var headerFragment, headElement, html, elm, value, dom = editor.dom;

					function setAttr(elm, name, value) {
						elm.attr(name, value ? value : undefined);
					}

					function addHeadNode(node) {
						if (headElement.firstChild) {
							headElement.insert(node, headElement.firstChild);
						} else {
							headElement.append(node);
						}
					}

					headerFragment = parseHeader();
					headElement = headerFragment.getAll('head')[0];
					if (!headElement) {
						elm = headerFragment.getAll('html')[0];
						headElement = new Node('head', 1);

						if (elm.firstChild) {
							elm.insert(headElement, elm.firstChild, true);
						} else {
							elm.append(headElement);
						}
					}

					// Add/update/remove XML-PI
					elm = headerFragment.firstChild;
					if (data.xml_pi) {
						value = 'version="1.0"';

						if (data.docencoding) {
							value += ' encoding="' + data.docencoding + '"';
						}

						if (elm.type !== 7) {
							elm = new Node('xml', 7);
							headerFragment.insert(elm, headerFragment.firstChild, true);
						}

						elm.value = value;
					} else if (elm && elm.type === 7) {
						elm.remove();
					}

					// Add/update/remove doctype
					elm = headerFragment.getAll('#doctype')[0];
					if (data.doctype) {
						if (!elm) {
							elm = new Node('#doctype', 10);

							if (data.xml_pi) {
								headerFragment.insert(elm, headerFragment.firstChild);
							} else {
								addHeadNode(elm);
							}
						}

						elm.value = data.doctype.substring(9, data.doctype.length - 1);
					} else if (elm) {
						elm.remove();
					}

					// Add meta encoding
					if (data.docencoding) {
						elm = null;
						each(headerFragment.getAll('meta'), function(meta) {
							if (meta.attr('http-equiv') === 'Content-Type') {
								elm = meta;
							}
						});

						if (!elm) {
							elm = new Node('meta', 1);
							elm.attr('http-equiv', 'Content-Type');
							elm.shortEnded = true;
							addHeadNode(elm);
						}

						elm.attr('content', 'text/html; charset=' + data.docencoding);
					}

					// Add/update/remove title
					elm = headerFragment.getAll('title')[0];
					if (data.title) {
						if (!elm) {
							elm = new Node('title', 1);
							elm.append(new Node('#text', 3)).value = data.title;
							addHeadNode(elm);
						}
					} else if (elm) {
						elm.remove();
					}

					// Add/update/remove meta
					each('keywords,description,author,copyright,robots'.split(','), function(name) {
						var nodes = headerFragment.getAll('meta'), i, meta, value = data[name];

						for (i = 0; i < nodes.length; i++) {
							meta = nodes[i];

							if (meta.attr('name') === name) {
								if (value) {
									meta.attr('content', value);
								} else {
									meta.remove();
								}

								return;
							}
						}

						if (value) {
							elm = new Node('meta', 1);
							elm.attr('name', name);
							elm.attr('content', value);
							elm.shortEnded = true;

							addHeadNode(elm);
						}
					});

					// Add/update/delete link
					elm = headerFragment.getAll('link')[0];
					if (elm && elm.attr('rel') === 'stylesheet') {
						if (data.stylesheet) {
							elm.attr('href', data.stylesheet);
						} else {
							elm.remove();
						}
					} else if (data.stylesheet) {
						elm = new Node('link', 1);
						elm.attr({
							rel: 'stylesheet',
							text: 'text/css',
							href: data.stylesheet
						});
						elm.shortEnded = true;

						addHeadNode(elm);
					}

					// Update body attributes
					elm = headerFragment.getAll('body')[0];
					if (elm) {
						setAttr(elm, 'dir', data.langdir);
						setAttr(elm, 'style', data.style);
						setAttr(elm, 'vlink', data.visited_color);
						setAttr(elm, 'link', data.link_color);
						setAttr(elm, 'alink', data.active_color);

						// Update iframe body as well
						dom.setAttribs(editor.getBody(), {
							style: data.style,
							dir: data.dir,
							vLink: data.visited_color,
							link: data.link_color,
							aLink: data.active_color
						});
					}

					// Set html attributes
					elm = headerFragment.getAll('html')[0];
					if (elm) {
						setAttr(elm, 'lang', data.langcode);
						setAttr(elm, 'xml:lang', data.langcode);
					}

					// No need for a head element
					if (!headElement.firstChild) {
						headElement.remove();
					}

					// Serialize header fragment and crop away body part
					html = new tinymce.html.Serializer({
						validate: false,
						indent: true,
						apply_source_formatting: true,
						indent_before: 'head,html,body,meta,title,script,link,style',
						indent_after: 'head,html,body,meta,title,script,link,style'
					}).serialize(headerFragment);

					head = html.substring(0, html.indexOf('</body>'));
				}

				function parseHeader() {
					// Parse the contents with a DOM parser
					return new tinymce.html.DomParser({
						validate: false,
						root_name: '#document'
					}).parse(head);
				}

				// D2L: function to strip html comments that could cause issues parsing the header
				function d2l_StripComments(content) {
					return content.replace(/<!--[^-]*?-->/g, '');
				}

				// D2L: function to update the design mode css styles and links
				function d2l_UpdateCustomStyles() {

					var headContent = d2l_StripComments(head);

					var customLinks = [];
					var linkArray = headContent.match(/<link[^>]*?>/gi);
					if (linkArray && linkArray.length > 0) {
						for (var h = 0; h < linkArray.length; h++) {
							var link = linkArray[h].toLowerCase();
							if ((link.indexOf('stylesheet') > 0) && (link.indexOf('href') > 0)) {
								link = link.replace('\'', '"');
								var hrefStart = link.indexOf('"', link.indexOf('href'));
								var href = link.substring(hrefStart + 1, link.indexOf('"', hrefStart + 1));
								href = editor.documentBaseURI.toAbsolute(href);
								customLinks.push(href);
								editor.contentCSS.push(href);
							}
						}
					}

					var mergeDotSegments = function(path) {
						// Leverage the browser to normalize paths: http://stackoverflow.com/a/14781678
						var anchor = document.createElement('a');
						anchor.href = path;

						// Some browsers prepend '/', some don't
						var pathname = anchor.pathname;
						if (pathname[0] !== '/') {
							pathname = '/' + pathname;
						}

						var normalized = anchor.protocol + '//' + anchor.hostname +
							pathname + anchor.search + anchor.hash;
						return normalized;
					};

					var editorHead = editor.dom.select('head')[0];
					if (!editorHead) {
						return;
					}

					var unusedHeadNodes = [];
					for (var i = 0; i < editorHead.childNodes.length; i++) {

						// remove linked CSS if it has been removed
						if ((editorHead.childNodes[i].tagName.toLowerCase() === 'link') && (editorHead.childNodes[i].getAttribute('rel') === 'stylesheet')) {
							href = editorHead.childNodes[i].href;
							if (href) {
								href = href.toLowerCase();
								if ((href.indexOf('/common/tiny_mce/') === -1) && (href.indexOf('/common/misc/') === -1) && (href.indexOf('/lp/htmleditor/') === -1)) {
									var keepLink = false;
									for (var j = 0; j < customLinks.length; j++) {
										var resolvedCustomLink = mergeDotSegments(customLinks[j]);
										if (href.indexOf(resolvedCustomLink) !== -1) {
											keepLink = true;
											break;
										}
									}
									if (!keepLink) {
										unusedHeadNodes.push(editorHead.childNodes[i]);
										var qsIndex = href.indexOf('?');
										if (qsIndex !== -1) {
											var qs = href.substr(qsIndex + 1);
											var qsParams = qs.split('&');
											href = href.substring(0, qsIndex);
											if (qsParams && qsParams.length > 0) {
												var qsFirst = true;
												for (var k = 0; k < qsParams.length; k++) {
													if (!/^v=/.test(qsParams[k])) {
														if (qsFirst) {
															href += ('?' + qsParams[k]);
															qsFirst = false;
														} else {
															href += ('&' + qsParams[k]);
														}
													}
												}
											}
										}
										// need to reset this in case user adds the stylesheet back again later
										editor.dom.files[href] = false;
									}
								}
							}
						}
					}
					for (var m = 0; m < unusedHeadNodes.length; m++) {
						editorHead.removeChild(unusedHeadNodes[m]);
					}

					var stylesArray = headContent.match(/<style[^>]*>(.|\n|\r)*?<\/style>/gi) || [];

					for (var n = 0; n < stylesArray.length; n++) {
						var style = stylesArray[n];
						if (style.toLowerCase().indexOf('@import') < 0 && style.toLowerCase().indexOf('text/css') > 0) {
							var tempNode = editor.getDoc().createElement('div');
							tempNode.innerHTML = style;
							editorHead.appendChild(tempNode.childNodes[0]);
						}
					}

					// Add desired styles back into the document
					editor.contentCSS.forEach(function(cssUrl) {
						var linkTag = editor.getDoc().createElement('link');
						linkTag.rel = 'stylesheet';
						linkTag.href = cssUrl;
						editorHead.appendChild(linkTag);
					});

					return;
				}

				function setContent(o) {
					var startPos, endPos, content = o.content, headerFragment, dom = editor.dom, elm;

					if (o.selection) {
						return;
					}

					function low(s) {
						return s.replace(/<\/?[A-Z]+/g, function(a) {
							return a.toLowerCase();
						});
					}

					// Ignore raw updated if we already have a head, this will fix issues with undo/redo keeping the head/foot separate
					if (o.format === 'raw' && head) {
						return;
					}

					if (o.source_view && editor.getParam('fullpage_hide_in_source_view')) {
						return;
					}

					// Parse out head, body and footer
					content = content.replace(/<(\/?)BODY/gi, '<$1body');
					startPos = content.indexOf('<body');

					if (startPos !== -1) {
						startPos = content.indexOf('>', startPos);
						head = low(content.substring(0, startPos + 1));

						endPos = content.indexOf('</body', startPos);
						if (endPos === -1) {
							endPos = content.length;
						}

						o.content = content.substring(startPos + 1, endPos);
						foot = low(content.substring(endPos));
					} else {
						head = getDefaultHeader();
						foot = '\n</body>\n</html>';
					}

					// D2L: call our custom function to update design mode styles
					d2l_UpdateCustomStyles();

					// Parse header and update iframe
					headerFragment = parseHeader();

					//D2L: don't bother with this since it doesn't handle removing obsolete styles anyway
					//each(headerFragment.getAll('style'), function(node) {
					//	if (node.firstChild) {
					//		styles += node.firstChild.value;
					//	}
					//});

					elm = headerFragment.getAll('body')[0];
					if (elm) {
						dom.setAttribs(editor.getBody(), {
							style: elm.attr('style') || '',
							dir: elm.attr('dir') || '',
							vLink: elm.attr('vlink') || '',
							link: elm.attr('link') || '',
							aLink: elm.attr('alink') || ''
						});
					}

					//D2L: don't bother with this since it doesn't handle removing obsolete styles anyway
					//dom.remove('fullpage_styles');

					//D2L: don't bother with this since it doesn't handle removing obsolete styles anyway
					//if (styles) {
					//	dom.add(editor.getDoc().getElementsByTagName('head')[0], 'style', {
					//		id : 'fullpage_styles'
					//	}, styles);
					//
					//	// Needed for IE 6/7
					//	elm = dom.get('fullpage_styles');
					//	if (elm.styleSheet) {
					//		elm.styleSheet.cssText = styles;
					//	}
					//}
				}

				function getDefaultHeader() {
					var header = '', value, styles = '';

					if (editor.getParam('fullpage_default_xml_pi')) {
						header += '<?xml version="1.0" encoding="' + editor.getParam('fullpage_default_encoding', 'ISO-8859-1') + '" ?>\n';
					}

					header += editor.getParam('fullpage_default_doctype', '<!DOCTYPE html>');
					header += '\n<html>\n<head>\n';

					if ((value = editor.getParam('fullpage_default_title'))) {
						header += '<title>' + value + '</title>\n';
					}

					if ((value = editor.getParam('fullpage_default_encoding'))) {
						header += '<meta http-equiv="Content-Type" content="text/html; charset=' + value + '" />\n';
					}

					if ((value = editor.getParam('fullpage_default_font_family'))) {
						styles += 'font-family: ' + value + ';';
					}

					if ((value = editor.getParam('fullpage_default_font_size'))) {
						styles += 'font-size: ' + value + ';';
					}

					if ((value = editor.getParam('fullpage_default_text_color'))) {
						styles += 'color: ' + value + ';';
					}

					header += '</head>\n<body' + (styles ? ' style="' + styles + '"' : '') + '>\n';

					return header;
				}

				function getContent(o) {
					if (!o.selection && (!o.source_view || !editor.getParam('fullpage_hide_in_source_view'))) {
						o.content = tinymce.trim(head) + '\n' + tinymce.trim(o.content) + '\n' + tinymce.trim(foot);
					}
				}

				editor.addCommand('mceFullPageProperties', showDialog);

				editor.addButton('fullpage', {
					title: 'Document properties',
					cmd: 'mceFullPageProperties'
				});

				editor.addMenuItem('fullpage', {
					text: 'Document properties',
					cmd: 'mceFullPageProperties',
					context: 'file'
				});

				editor.on('BeforeSetContent', setContent);
				editor.on('GetContent', getContent);
			});
		}
	}
};
window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.Fullpage = FullpageBehavior;
