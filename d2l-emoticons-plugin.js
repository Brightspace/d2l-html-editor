import './d2l-html-editor-plugin.js';
var EmoticonsBehavior = {
	plugin: {
		addPlugin: function() {
			tinymce.PluginManager.add('d2l_emoticons', function(editor) { // eslint-disable-line no-undef
				function insertEmoticon(editor, src, alt, dataD2lEmoji) {
					editor.insertContent(editor.dom.createHTML('img', { src: src, alt: alt, 'data-d2l-emoji': dataD2lEmoji }));
				}

				var emoticons = [
					[
						{ name: 'happy-light', langterm: 'happy with light skin tone' },
						{ name: 'loveeyes-light', langterm: 'love eyes with light skin tone' },
						{ name: 'joy-light', langterm: 'joy with light skin tone' },
						{ name: 'wow-light', langterm: 'wow with light skin tone' },
						{ name: 'upsidedown-light', langterm: 'upside down with light skin tone' },
						{ name: 'wink-light', langterm: 'wink with light skin tone' }
					],
					[
						{ name: 'goofy-light', langterm: 'goofy with light skin tone' },
						{ name: 'stareyes-light', langterm: 'star eyes with light skin tone' },
						{ name: 'cool-light', langterm: 'cool with light skin tone' },
						{ name: 'blush-light', langterm: 'blush with light skin tone' },
						{ name: 'thinking-light', langterm: 'thinking with light skin tone' },
						{ name: 'thumbsup-light', langterm: 'thumbs up with light skin tone' }
					],
					[
						{ name: 'happy-dark', langterm: 'happy with dark skin tone' },
						{ name: 'loveeyes-dark', langterm: 'love eyes with dark skin tone' },
						{ name: 'joy-dark', langterm: 'joy with dark skin tone' },
						{ name: 'wow-dark', langterm: 'wow with dark skin tone' },
						{ name: 'upsidedown-dark', langterm: 'upside down with dark skin tone' },
						{ name: 'wink-dark', langterm: 'wink with dark skin tone' }
					],
					[
						{ name: 'goofy-dark', langterm: 'goofy with dark skin tone' },
						{ name: 'stareyes-dark', langterm: 'star eyes with dark skin tone' },
						{ name: 'cool-dark', langterm: 'cool with dark skin tone' },
						{ name: 'blush-dark', langterm: 'blush with dark skin tone' },
						{ name: 'thinking-dark', langterm: 'thinking with dark skin tone' },
						{ name: 'thumbsup-dark', langterm: 'thumbs up with dark skin tone' }
					],
					[
						{ name: 'star', langterm: 'star' },
						{ name: 'heart', langterm: 'heart' },
						{ name: 'celebrate', langterm: 'celebrate' },
						{ name: 'sunshine', langterm: 'sunshine' },
						{ name: 'funsterred', langterm: 'red funster' },
						{ name: 'funsterblue', langterm: 'blue funster' }
					]
				];

				function getEmoticonsBaseUrl() {
					var emoticonsCdnVersion = '1.0.0';
					return 'https://s.brightspace.com/lib/emoticons/' + emoticonsCdnVersion + '/';
				}

				function getHtml() {
					var emoticonsBaseUrl = getEmoticonsBaseUrl();
					var emoticonsHtml;
					emoticonsHtml = '<table role="list" class="mce-grid">';
					tinymce.each(emoticons, function(row) { // eslint-disable-line no-undef
						emoticonsHtml += '<tr>';
						tinymce.each(row, function(icon) { // eslint-disable-line no-undef
							var iconName = icon.name;
							var emoticonUrl = emoticonsBaseUrl + iconName + '.svg';
							var localizedEmoticonName = tinymce.EditorManager.i18n.translate(icon.langterm); // eslint-disable-line no-undef
							emoticonsHtml += '<td><a href="#" tabindex="-1" role="option" style="cursor: pointer;" ' +
								'data-mce-url="' + emoticonUrl + '" ' +
								'data-mce-alt="' + localizedEmoticonName + '" ' +
								'aria-label="' + localizedEmoticonName + '" ' +
								'data-d2l-emoji="' + iconName + '">' +
								'<img src="' + emoticonUrl + '" style="width: 18px; height: 18px; padding: 5px;" role="presentation" /></a></td>';
						});
						emoticonsHtml += '</tr>';
					});
					emoticonsHtml += '</table>';
					return emoticonsHtml;
				}

				editor.addMenuItem('d2l_emoticons', {
					text: 'Emoticons',
					icon: 'emoticons',
					title: 'Emoticons',
					menu: [{
						type: 'panel',
						html: getHtml(),
						onclick: function(e) {
							var linkElm = editor.dom.getParent(e.target, 'a');
							if (linkElm) {
								insertEmoticon(editor, linkElm.getAttribute('data-mce-url'), linkElm.getAttribute('data-mce-alt'), linkElm.getAttribute('data-d2l-emoji'));
								this.parent().hideAll();
							}
						},
						style: 'padding: 5px;'
					}]
				});

				editor.addButton('d2l_emoticons', {
					type: 'panelbutton',
					icon: 'emoticons',
					title: 'Emoticons',
					tooltip: 'Emoticons',
					panel: {
						autohide: true,
						html: getHtml(),
						onclick: function(e) {
							var linkElm = editor.dom.getParent(e.target, 'a');
							if (linkElm) {
								insertEmoticon(editor, linkElm.getAttribute('data-mce-url'), linkElm.getAttribute('data-mce-alt'), linkElm.getAttribute('data-d2l-emoji'));
								this.hide();
							}
						},
						style: 'padding-top: 5px; padding-left: 5px;'
					}
				});
			});
		}
	}
};

window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.Emoticons = EmoticonsBehavior;
