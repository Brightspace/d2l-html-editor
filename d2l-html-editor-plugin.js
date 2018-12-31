import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';

function hasAttribute(node, name) {
	if (node.hasAttribute !== undefined) {
		return node.hasAttribute(name);
	} else {
		var val = node.getAttribute(name);
		return (val !== null) && (val.length > 0);
	}
}

function getSelectedNode(editor) {
	var node = null;
	if (editor && editor.selection) {
		node = editor.selection.getNode();
	}

	return node;
}

function getSelectionContent(editor) {
	var content = '';
	if (editor && editor.selection) {
		content = tinymce.DOM.decode(editor.selection.getContent());  // eslint-disable-line no-undef
	}
	return content;
}

function clearBookmark(editor, bookmark) {
	var selectedNode = getSelectedNode(editor);
	var parentNode = dom(selectedNode).parentNode;
	var nodeStart = dom(parentNode).querySelector('#' + bookmark.id + '_start');
	if (nodeStart) {
		var nodeStartParent = dom(nodeStart).parentNode;
		dom(nodeStartParent).removeChild(nodeStart);
	}
	var nodeEnd = dom(parentNode).querySelector('#' + bookmark.id + '_end');
	if (nodeEnd) {
		var nodeEndParent = dom(nodeEnd).parentNode;
		dom(nodeEndParent).removeChild(nodeEnd);
	}
}

function callIfrauService(client, serviceId, editor, fn) {
	client.getService(serviceId, '0.1').then(function(service) {
		fn.call(null, service, editor);
	});
}

function simplePluginPostRender(editor, postRender) {
	function curriedPostRender(args) {
		postRender(editor, args.target);
	}

	if (postRender) {
		return curriedPostRender;
	}
}

function configureSimpleService(client, plugin) {
	return client.getService(plugin.serviceId, '0.1').then(function(service) {
		return service.config();
	}).then(function(config) {
		if (!config.isEnabled) {
			// Add empty plugin so that we don't have to conditionally set the plugin list - maybe fix later
			tinymce.PluginManager.add(plugin.id, function() {   // eslint-disable-line no-undef
			});
		} else {
			tinymce.PluginManager.add(plugin.id, function(editor) {   // eslint-disable-line no-undef
				if (plugin.isMenu) {
					editor.addMenuItem(plugin.id, {
						text: plugin.label,
						icon: plugin.icon,
						onclick: function() {
							callIfrauService(client, plugin.serviceId, editor, plugin.cmd);
						},
						onPostRender: simplePluginPostRender(editor, plugin.postRender)
					});
				} else {
					editor.addButton(plugin.id, {
						tooltip: plugin.label,
						icon: plugin.icon,
						onclick: function() {
							callIfrauService(client, plugin.serviceId, editor, plugin.cmd);
						},
						onPostRender: simplePluginPostRender(editor, plugin.postRender)
					});
				}

				plugin.init(editor, config);
			});
		}
	}).catch(function() {
		tinymce.PluginManager.add(plugin.id, function() {   // eslint-disable-line no-undef
		});
	});
}

/** @polymerBehavior */
var PluginBehavior = {
	getSelectedNode: getSelectedNode,
	getSelectionContent: getSelectionContent,
	clearBookmark: clearBookmark,
	configureSimpleService: configureSimpleService,
	callIfrauService: callIfrauService,
	hasAttribute: hasAttribute
};

window.D2LHtmlEditor = window.D2LHtmlEditor || {};
window.D2LHtmlEditor.PolymerBehaviors = window.D2LHtmlEditor.PolymerBehaviors || {};
/** @polymerBehavior */
window.D2LHtmlEditor.PolymerBehaviors.Plugin = PluginBehavior;
