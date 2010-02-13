/*
 * viewer.tinylog.js
 * Version 0.1
 *
 * 2010-02-09
 * 
 * By Elijah Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: true,
  regexp: true, strict: true, newcap: true, immed: true, maxlen: 90 */

"use strict";

if (typeof tinylog === "undefined") {
	var tinylog = {encoders:{}, decoders:{}};
}

if (typeof document !== "undefined") {
(function (tinylog, doc) {
	var logInput  = doc.getElementById("logfile"),
	fakeInput     = doc.getElementById("fakeinput"),
	fileNameLabel = doc.getElementById("filename").firstChild,
	False         = !1;
	
	tinylog.USE_NATIVE    = False;
	tinylog.SAFETY_MARGIN = False;
	
	logInput.addEventListener("mouseover", function () {
		//fakeInput.classList.add("hover");
		fakeInput.className = "hover";
	}, False);
	logInput.addEventListener("mouseout", function () {
		//fakeInput.classList.remove("hover");
		fakeInput.className = "";
	}, False);
	
	if (typeof FileReader !== "undefined") {
		var reader = new FileReader,
		onFileSelect = function () {
			var file = logInput.files.item(0);
			fileNameLabel.nodeValue = file.fileName;
			reader.readAsBinaryString(file);
		};
		
		reader.addEventListener("load", function (evt) {
			tinylog.clear();
			try {
				var log = tinylog.decode(evt.target.result);
		
				for (var i = 0, len = log.length; i < len; i++) {
					tinylog.postEntry(new Date(log[i][0]), log[i][1]);
				}
			} catch (e) {
				alert(e);
			}
		}, False);
	
		logInput.addEventListener("change", onFileSelect, False);
		
		// if the user refreshes the page, persist their selected file
		if (logInput.value) {
			fileNameLabel.nodeValue = logInput.value;
			onFileSelect();
		}
	
	}
}(tinylog, document));
}
