/* global Promise */
window.ifrauclient = function() {

	return {
		getService: function() {
			return Promise.resolve({
				config: function() {
					return Promise.resolve({});
				}
			});
		},
		connect: function() {
			return Promise.resolve({});
		},
		request: function() {
			return Promise.resolve({});
		},
		sendEvent: function() {
		}
	};
};

