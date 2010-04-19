"use strict";

(function (tinylog, doc) {
	tinylog.setEncodings("JSON", "DEFLATE");

	var el = function (id) {
		return doc.getElementById(id);
	},
	observe = function (id, event, handler) {
		el(id).addEventListener(event, handler, false);
	};
	
	observe("log-button", "click", function () {
		tinylog.log(el("message").value);
	});
	
	observe("save-button", "click", function () {
		doc.defaultView.location.href =
			"data:application/x-tinylog;base64," +
			btoa(tinylog.encode());
	});
	
	observe("compression", "change", function (evt) {
		var encodings = ["JSON"];
		if (evt.target.checked) {
			encodings.push("DEFLATE");
		}
		tinylog.setEncodings.apply(tinylog, encodings);
	});
	
	tinylog.display();
}(tinylog, document));
