const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = /*html*/`<dom-module id="d2l-placeholder-styles">
  <template>
	<style>
		:host ::slotted(.html-editor-container-hover) {
			border-color: #006fbf; /*$d2l-color-celestine*/
			border-width: 2px;
			outline-width: 0;
			padding: calc(0.4rem - 1px) calc(1rem - 1px)
		}

		:host ::slotted(.html-editor-input-placeholder) {
			position: absolute;
			top: 0;
			left: 0;
			color: #b9c2d0; /*d2l-colors-pressicus*/
			font-size: 0.8rem;
			line-height: 1.2rem;
			padding: 0.4rem 1rem;
			cursor: text
		}
	</style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
