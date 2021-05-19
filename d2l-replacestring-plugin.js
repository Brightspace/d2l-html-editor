/*
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 **/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import './d2l-html-editor-plugin.js';

function encodeReplaceStrings(context, replacementToken, replacementValue) {
	var obj = context;
	var html = obj.content;

	if (html !== null && html.length > 0) {

		var func = function(match) {
			var tempNode = document.createElement('div');

			// setting the innerHTML automatically closes any opening tags. The regex
			// only matches the opening tag, so this will cause a duplicate closing tag
			// when we replace later.
			tempNode.innerHTML = match;
			var img = tempNode.firstChild;
			if (!img) return match;

			var src = img.getAttribute('data-mce-src'); //plugin.Attributes.Data);

			if (!src) {
				src = img.getAttribute('src');
			}
			if (!src) return match;

			var originalSrc = src;

			// loop through possible replace strings and replace them
			var key = replacementToken;
			var regEx = new RegExp('{' + key + '}', 'i');
			src = src.replace(regEx, replacementValue);

			if (src !== originalSrc) {
				img.setAttribute('src', src);
				img.setAttribute('data-d2l-src', encodeURIComponent(originalSrc));

				var temp = tempNode.innerHTML;
				temp = temp.replace(/<\/iframe>/gi, '');

				return temp;
			} else {
				// no change
				return match;
			}
		};

		// find all occurrences of <img src="something" /> and call func
		html = html.replace(/<(img|iframe)[^>]*\ssrc[\s]*=[\s]*(\'([^\']*)\'|\"([^\"]*)\"|([^>^\s^\/]*))[^>]*>/gi, func); // eslint-disable-line no-useless-escape
		obj.content = html;
	}
}

function decodeReplaceStrings(obj) {
	var html = obj.content;

	if (html !== null && html.length > 0) {

		var func = function(match) {
			var tempNode = document.createElement('div');

			// setting the innerHTML automatically closes any opening tags. The regex
			// only matches the opening tag, so this will cause a duplicate closing tag
			// when we replace later.
			tempNode.innerHTML = match;

			var img = tempNode.firstChild;
			if (!img) return match;

			var d2l_src = img.getAttribute('data-d2l-src');

			if (d2l_src !== '') {

				img.setAttribute('src', decodeURIComponent(d2l_src));
				img.removeAttribute('data-d2l-src');

				var temp = tempNode.innerHTML;
				temp = temp.replace(/<\/iframe>/gi, '');

				return temp;
			} else {
				return match;
			}
		};

		// find all occurrences of <img data-d2l-src="something" /> and call func
		html = html.replace(/<(img|iframe)[^>]*\sdata-d2l-src[\s]*=[\s]*(\'([^\']*)\'|\"([^\"]*)\"|([^>^\s^\/]*))[^>]*>/gi, func); // eslint-disable-line no-useless-escape
		// convert %7Bstuff%7D to {stuff} -> Mozilla based browsers
		obj.content = html.replace(/(%7B(orgId|orgName|orgUnitId|OrgUnitName|OrgUnitCode|OrgUnitPath|UserId|UserName|OrgDefinedId|FirstName|LastName|ExternalEmail|InternalEmail|RoleId)%7D)/gi, '{$2}');
	}
}

/*global tinymce:true */
/** @polymerBehavior */
var ReplaceStringBehavior = {
	plugin: {
		addPlugin: function(client) {
			return client.request('orgUnit').then(function(orgUnit) {
				tinymce.PluginManager.add('d2l_replacestring', function(editor) {
					editor.on('BeforeSetContent', function(e) {
						encodeReplaceStrings(e, 'orgUnitId', orgUnit.OrgUnitId);
					});

					editor.on('PostProcess', function(e) {
						if (e.get) {
							decodeReplaceStrings(e);
						}
					});
				});
			});
		}
	}
};
window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.ReplaceString = ReplaceStringBehavior;
