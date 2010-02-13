"use strict";

if (typeof tinylog === "undefined") {
	var tinylog = {encoders:{}, decoders:{}};
}

(function (tinylog, doc) {
	tinylog.USE_NATIVE = false;
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
	
	observe("encoding", "change", function (evt) {
		tinylog.encoding = evt.target.value + (el("compression").checked ? "+deflate" : "");
	});
	
	observe("compression", "change", function (evt) {
		tinylog.encoding = el("encoding").value + (evt.target.checked ? "+deflate" : "");
	});
}(tinylog, document));
