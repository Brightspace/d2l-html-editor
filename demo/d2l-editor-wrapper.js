/*
`d2l-editor-wrapper`
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import './d2l-html-editor-client.js';
import '../d2l-html-editor.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-editor-wrapper">
	<template strip-whitespace="">
		<style>
			:host {
				display: inline-block;
			}

			#test1 {
				padding: 0.4rem 0.75rem;
				border: 1px solid blue;
			}

		</style>
		<h2>Hello [[prop1]]!</h2>
		<d2l-html-editor editor-id="[[prop1]]" toolbar="[[_toolbar]]" plugins="[[_plugins]]">
			<div id="[[prop1]]" class="d2l-richtext-editor-container"></div>
		</d2l-html-editor>
	</template>
	
</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
	is: 'd2l-editor-wrapper',
	properties: {
		prop1: {
			type: String,
		},
		_toolbar: {
			type: String,
			value: 'bold italic bullist',
		},
		_plugins: {
			type: String,
			value: 'lists paste d2l_placeholder d2l_filter d2l_replacestring',
		},
	},
	attached: function() {
		var editor = this.$$('d2l-html-editor');
		editor.appRoot = editor.resolveUrl('../root/');
		editor.d2lPluginSettings = {};
	}
});
