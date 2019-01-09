import './d2l-html-editor-plugin.js';

var regExp = {
	HrefString: '_mce_href=\"[^\"]*\"', // eslint-disable-line no-useless-escape
	SrcString: '_mce_src=\"[^\"]*\"', // eslint-disable-line no-useless-escape
	OpenScript: '<mce:script',
	CloseScript: '</mce:script>'
};

function StringBuilder(initialValue) {
	this.myString = initialValue || '';
}

StringBuilder.prototype.Append = function(value) {
	this.myString += value;
};

StringBuilder.prototype.ToString = function() {
	return this.myString;
};

function getImageClassName(classId) {
	if (classId !== null) {
		classId = classId.toLowerCase();
		var guidIndex = classId.indexOf(':');
		if (guidIndex !== -1 && (classId.length > guidIndex + 1)) {
			classId = classId.substring(guidIndex + 1);
		}
	} else {
		classId = '';
	}

	switch (classId) {
		case 'd27cdb6e-ae6d-11cf-96b8-444553540000':
		case 'application/x-shockwave-flash':
		case 'd2l_flash':
			return 'disf_flash';

		case '166b1bca-3f9c-11cf-8075-444553540000':
			return 'disf_shockwave';

		case '6bf52a52-394a-11d3-b153-00c04f79faa6':
		case '22d6f312-b0f6-11d0-94ab-0080c74c7e95':
		case '05589fa1-c356-11ce-bf01-00aa0055595a':
			return 'disf_windowsmedia';

		case '02bf25d5-8c17-4b23-bc80-d3488abddc6b':
		case 'd2l_qt':
			return 'disf_quicktime';

		case 'cfcdaa03-8be4-11cf-b84b-0020afbbccfa':
			return 'disf_realmedia';

		default:
			return 'disf_default';
	}
}

function getAttributeValue(attributeName, html) {
	var attValue = null;
	var attRe = new RegExp(attributeName + '=(\"[^<>"]*\"|\'[^<>\']*\'|\w+)', 'i'); // eslint-disable-line no-useless-escape
	var attMatch = attRe.exec(html);
	if (attMatch !== null && attMatch.length > 1) {
		if (attMatch[1].length > 1 &&
			(attMatch[1].substr(0, 1) === '\'' || attMatch[1].substr(0, 1) === '\"')) { // eslint-disable-line no-useless-escape
			attValue = attMatch[1].substring(1, attMatch[1].length - 1);
		} else {
			attValue = attMatch[1];
		}
	}
	return attValue;
}

function createImage(html) {
	var width = getAttributeValue('width', html);
	if (width === null) {
		width = '150px';
	}

	var height = getAttributeValue('height', html);
	if (height === null) {
		height = '150px';
	}

	var classId = getAttributeValue('classid', html);
	if (classId === null) {
		classId = getAttributeValue('type', html);
	}

	var altLabel = tinymce.EditorManager.i18n.translate('Insert stuff placeholder');
	// create an image with the encoded content
	return '<img src="/d2l/img/LP/htmlEditor/eq_trans.gif" alt="' + altLabel + '" ' +
		'width="' + width + '" ' +
		'height="' + height + '" ' +
		'class="' + getImageClassName(classId) + ' d2l-html-editor' + '" ' +
		'data-isf-content="' + encodeURIComponent(html) + '" />';

}

function createElement(html, height, width) {
	if (width === null) {
		width = '100px';
	}
	if (height === null) {
		height = '100px';
	}

	html = decodeURIComponent(html);

	// remove plugin_href if necessary (clean-up any possible left-over Plugin stuff)
	html = html.replace(
		new RegExp(regExp.HrefString, 'g'),
		''
	);
	html = html.replace(
		new RegExp(regExp.SrcString, 'g'),
		''
	);

	html = html.replace(new RegExp('width=[\"\']{1}[0-9px]+[\'\"]', 'gi'), 'width="' + width + '"'); // eslint-disable-line no-useless-escape
	html = html.replace(new RegExp('height=[\"\']{1}[0-9px]+[\'\"]', 'gi'), 'height="' + height + '"'); // eslint-disable-line no-useless-escape

	html = html.replace(new RegExp('width=[0-9px]+', 'gi'), 'width=' + width);
	html = html.replace(new RegExp('height=[0-9px]+', 'gi'), 'height=' + height);

	return html;

}

function setDefaultImageStyle(context) {
	if (context.content === null || context.content.length <= 0) {
		return;
	}

	var node = new DOMParser().parseFromString(context.content, 'text/html');
	if (!node || !node.body || !node.body.firstElementChild) {
		return;
	}

	var img = node.body.firstElementChild;
	if (!img || img.nodeName.toUpperCase() !== 'IMG'
		|| img.hasAttribute('width') || img.hasAttribute('height')
		|| img.style.width || img.style.height) {
		return;
	}

	img.style.maxWidth = '100%';
	img.setAttribute('data-d2l-editor-default-img-style', 'true');

	context.content = img.outerHTML;
}

function convertToImages(context, isWindowModeOpaque) {
	if (context.content && context.content.length > 0 &&
		(context.content.search(/(<object|<embed|<iframe)/i) !== -1)) {

		var html = context.content;
		var sb = new StringBuilder();
		var embedStartRe = new RegExp('(<embed)', 'i');
		var objectStartRe = new RegExp('(<object)', 'i');
		var iFrameStartRe = new RegExp('(<iframe)', 'i');
		var scriptStartRe = new RegExp('(<script|' + regExp.OpenScript + ')', 'i');
		var searchRe = new RegExp('(<object|<embed|<iframe|<script|' + regExp.OpenScript + ')', 'i');

		var toIndex = 0;
		while (html.length > 0) {

			toIndex = html.search(searchRe);
			if (toIndex === 0) {
				embedStartRe.lastIndex = 0;
				scriptStartRe.lastIndex = 0;
				objectStartRe.lastIndex = 0;
				iFrameStartRe.lastIndex = 0;

				searchRe.lastIndex = toIndex;
				var match = searchRe.exec(html)[0];
				if (scriptStartRe.test(match)) {

					// skip script
					var scriptEndIndex = html.indexOf('>', toIndex);
					if (html.substr(scriptEndIndex - 1, 1) === '/') {
						toIndex = scriptEndIndex + 1;
					} else {
						var scriptEndRe = new RegExp('(<\\/script>|' + regExp.CloseScript + ')', 'i');
						scriptEndIndex = html.search(scriptEndRe);
						if (scriptEndIndex !== -1) {
							toIndex = html.indexOf('>', scriptEndIndex) + 1;
						} else {
							toIndex = html.indexOf('>', toIndex) + 1;
						}
					}

					// append the script
					sb.Append(html.substring(0, toIndex));
					html = html.substring(toIndex);

				} else if (objectStartRe.test(match)) {

					var isValidObject = true;
					var objectHtml = html.substring(0).toLowerCase();
					var objectCount = 1;
					var objectFromIndex = 7;
					var objectStartIndex = 0;
					var objectEndIndex = 0;

					while (objectCount > 0) {
						objectStartIndex = objectHtml.indexOf('<object', objectFromIndex);
						objectEndIndex = objectHtml.indexOf('</object>', objectFromIndex);
						if (objectStartIndex !== -1 && objectStartIndex < objectEndIndex) {
							objectCount += 1;
							objectFromIndex = objectStartIndex + 7;
						} else {
							if (objectEndIndex !== -1) {
								objectCount -= 1;
								objectFromIndex = objectEndIndex + 9;
							}
						}

						// protected against bad user mark-up
						if (objectEndIndex === -1) {
							isValidObject = false;
							break;
						}
					}

					if (isValidObject) {
						sb.Append(createImage(html.substring(0, objectFromIndex)));
						html = html.substring(objectFromIndex);
					} else {
						sb.Append(html);
						html = '';
					}

				} else if (embedStartRe.test(match)) {

					var embedEndIndex = html.indexOf('>');
					if (html.substr(embedEndIndex - 1, 1) === '/') {
						embedEndIndex = embedEndIndex + 1;
					} else {
						var embedEndRe = new RegExp('</embed>', 'i');
						embedEndIndex = html.search(embedEndRe);
						if (embedEndIndex !== -1) {
							embedEndIndex = embedEndIndex + 8;
						} else {
							embedEndIndex = html.indexOf('>') + 1;
						}
					}

					sb.Append(createImage(html.substring(0, embedEndIndex)));
					html = html.substring(embedEndIndex);

				} else if (iFrameStartRe.test(match)) {

					var iFrameEndIndex = html.indexOf('>');
					var iFrameHtml = html.substring(0, iFrameEndIndex + 1);

					var iFrameSrcRe = new RegExp('src=(\'|")[^>]*youtube[^\'">]*(\'|")', 'i');

					iFrameHtml = iFrameHtml.replace(iFrameSrcRe, function(srcHtml) {

						if (isWindowModeOpaque) {
							if (srcHtml.indexOf('wmode') === -1) {
								if (srcHtml.indexOf('?') === -1) {
									return srcHtml.substring(0, srcHtml.length - 1) + '?wmode=opaque' + srcHtml.substring(srcHtml.length - 1);
								} else {
									return srcHtml.substring(0, srcHtml.length - 1) + '&amp;wmode=opaque' + srcHtml.substring(srcHtml.length - 1);
								}
							} else {
								return srcHtml.replace(/wmode=([^&#\'\"]*)/, 'wmode=opaque'); // eslint-disable-line no-useless-escape
							}
						} else {
							if (srcHtml.indexOf('wmode') !== -1) {
								return srcHtml = srcHtml.replace(/wmode=([^&#\'\"]*)/, 'wmode='); // eslint-disable-line no-useless-escape
							} else {
								return srcHtml;
							}
						}

					});

					sb.Append(iFrameHtml);

					html = html.substring(iFrameEndIndex + 1);

				}

			} else {
				if (toIndex === -1) {
					sb.Append(html);
					break;
				} else {
					sb.Append(html.substring(0, toIndex));
					html = html.substring(toIndex);
				}
			}

		}

		context.content = sb.ToString();
	}
	if (isDaylightEnabled) {
		setDefaultImageStyle(context);
	}
}

function isDaylightEnabled() {
	// Note: This won't work when used in a FRA, so the default will be to always set the default image style
	// which seems like a reasonable default
	if (!document || !document.body || !document.body.classList) {
		return true;
	}
	return document.body.classList.contains('daylight');
}

function convertToElements(context) {
	if (context.content && context.content.length > 0 &&
		(context.content.search(/data-isf-content/i) !== -1)) {

		var html = context.content;
		var sb = new StringBuilder();

		var toIndex = 0;
		var imgStartRe = new RegExp('(<img)', 'i');

		while (html.length > 0) {

			imgStartRe.lastIndex = 0;
			toIndex = html.search(imgStartRe);
			if (toIndex === 0) {

				var imgEndIndex = html.indexOf('>');
				if (html.substr(imgEndIndex - 1, 1) === '/') {
					imgEndIndex = imgEndIndex + 1;
				} else {
					var imgEndRe = new RegExp('</img>', 'i');
					imgEndIndex = html.search(imgEndRe);
					if (imgEndIndex !== -1) {
						imgEndIndex = imgEndIndex + 6;
					} else {
						imgEndIndex = html.indexOf('>') + 1;
					}
				}

				var imgHtml = html.substring(0, imgEndIndex);
				if (imgHtml.indexOf('data-isf-content') !== -1) {
					sb.Append(createElement(
						getAttributeValue('data-isf-content', imgHtml),
						getAttributeValue('height', imgHtml),
						getAttributeValue('width', imgHtml)
					));
				} else {
					sb.Append(imgHtml);
				}
				html = html.substring(imgEndIndex);

			} else {
				if (toIndex === -1) {
					sb.Append(html);
					break;
				} else {
					sb.Append(html.substring(0, toIndex));
					html = html.substring(toIndex);
				}
			}
		}
		context.content = sb.ToString();
	}
}

function command(service, editor) {
	var bookmark = editor.selection.getBookmark();
	service.click(editor.id).then(function(response) {
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

function init(editor, config) {
	editor.on('BeforeSetContent', function(e) {
		convertToImages(e, config.isWindowModeOpaque);
	});

	editor.on('PostProcess', function(e) {
		if (e.get) {
			convertToElements(e);
		}
	});
}

function addPlugin(client) {
	return window.D2LHtmlEditor.PolymerBehaviors.Plugin.configureSimpleService(
		client, {
			id: 'd2l_isf',
			label: 'Insert Stuff',
			icon: 'd2l_isf',
			serviceId: 'fra-html-editor-isf',
			cmd: command,
			init: init
		});
}

/*global tinymce:true */
/** @polymerBehavior */
var InsertStuffBehavior = {
	plugin: {
		addPlugin: addPlugin
	}
};

window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.InsertStuff = InsertStuffBehavior;
