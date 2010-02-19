"use strict";

var tinylog = tinylog || {encoders:{}, decoders:{}};

(function (tinylog, doc) {
	if (typeof console !== "undefined") {
		tinylog.USE_NATIVE = confirm("A native console has been detected.\nUse it instead of tinylog for the demo?");
	}
	tinylog.encoding   = "raw+deflate";

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
			"data:application/vnd.sephr.tinylog;base64," +
			btoa(tinylog.encode());
	});
	
	observe("encoding", "change", function (evt) {
		tinylog.encoding = evt.target.value + (el("compression").checked ? "+deflate" : "");
	});
	
	observe("compression", "change", function (evt) {
		tinylog.encoding = el("encoding").value + (evt.target.checked ? "+deflate" : "");
	});
}(tinylog, document));
