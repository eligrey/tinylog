/*
 * tinylog JavaScript Library
 *
 * 2010-04-18
 * 
 * By Eli Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*global print, document, Image, btoa, escape, unescape */

/*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, regexp: true, strict: true,
newcap: true, immed: true, maxerr: 200 */

"use strict";

var tinylog = tinylog || {encoders:{}, decoders:{}}, console;

if (!console) {
	console = {};
}

(function (tinylog, console) {

	var stringFromCharCodes = function () {
		return String.fromCharCode.apply(String, arguments);
	},
	l = function (string) {
		return string.toLocaleString();
	},
	
	blankGIF = "GIF89a" + stringFromCharCodes(
		1, 0, 1, 0, 145, 255, 0, 255, 255, 255, 0, 0, 0, 192, 192, 192, 0, 0, 0, 33,
		249, 4, 1, 0, 0, 2, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 84, 1, 0, 59
	),
	blankGIFcheck  = new RegExp("^" + blankGIF),
	
	entries        = tinylog.entries = [],
	encoders       = tinylog.encoders,
	decoders       = tinylog.decoders,
	encodings      = tinylog.encodings = ["JSON"],
	unsupportedEnc = l("Unsupported encoding: %s"),
	consoleLog,
	
	False          = !1,
	True           = !0,
	
	slice = function (arrayLike) {
		return Array.prototype.slice.call(arrayLike);
	},
	storeEntry = function (date, message) {
		entries.push([
			date.getTime(),
			message
		]);
	},
	uninit = tinylog.uninit = function () {
		tinylog.postEntry = storeEntry;
	},
	encodeLog = tinylog.encode = function (logEncodings, logData) {
		if (!logData) {
			logData = entries;
		}
		
		if (!logEncodings) {
			logEncodings = encodings;
		}
		
		if (typeof logEncodings === "string") {
			// allow passing a single encoding instead of an array of incodings
			logEncodings = [logEncodings];
		}
		
		for (var i = 0, len = logEncodings.length; i < len; i++) {
			if (encoders[logEncodings[i]]) {
				logData = logEncodings[i] + "\n" + encoders[logEncodings[i]](logData);
			} else {
				throw new Error(unsupportedEnc.replace("%s", logEncodings[i]));
			}
		}
		
		return logData;
	},
	setEncodings = tinylog.setEncodings = function () {
		encodings.length = 0;
		
		for (var i = 0, len = arguments.length; i < len; i++) {
			encodings.push(arguments[i]);
		}
	};
	
	tinylog.postEntry = storeEntry;
	
	tinylog.display =
	tinylog.setSafetyMargin =
		function () {};
	
	tinylog.log = function () {
		tinylog.postEntry(new Date(), slice(arguments).join(" "));
	};
	
	tinylog.clear = function () {
		entries.length = 0;
	};
		
	encoders.JSON = function (log) {
		return unescape(encodeURIComponent(JSON.stringify(log)));
	};
	
	decoders.JSON = function (data) {
		return JSON.parse(decodeURIComponent(escape(data)));
	};
	
	tinylog.decode = function (data) {
		if (blankGIFcheck.test(data)) {
			data = data.substr(blankGIF.length);
		}
		
		var index = data.indexOf("\n"),
		encoding  = data.substr(0, index);
		
		if (decoders[encoding]) {
			return decoders[encoding](data.substr(index + 1));
		} else {
			throw new Error(unsupportedEnc + encoding);
		}
	};
	
	if (console.log && !console.TINYLOG) {
		tinylog.postEntry = function (date, message) {
			storeEntry(date, message);
			console.log(message);
		};
	} else if (typeof document !== "undefined") { (function () { // DOM document
		var $div      = "div",
		$style        = "style",
		$class        = "className",
		$setAttr      = "setAttribute",
		$data         = "data-",
		$title        = "title",
		$tinylog      = "tinylog",
		$tinylogSpace = $tinylog + " ",
		$saveButton   = $tinylog + "-save-button",
		$tinylogEntry = $tinylogSpace + "tinylog-entry",
		$tinylogEntryText = $tinylogEntry + "-text",
		
		doc = document,
		view    = doc.defaultView,
		docElem = doc.documentElement,
		base64  = btoa,
		docElemStyle = docElem[$style],
		useSafetyMargin = True,
		changedSinceUpdate = True,
		postEntry,
		
		append = function (to, elem) {
			return to.appendChild(elem);
		},
		createElement = function (localName) {
			return doc.createElement(localName);
		},
		createTextNode = function (text) {
			return doc.createTextNode(text);
		},
		observer = function (obj, event, handler) {
			if (obj.addEventListener) {
				obj.addEventListener(event, handler, False);
			} else if (obj.attachEvent) {
				obj.attachEvent("on" + event, handler);
			}
			return [obj, event, handler];
		},
		unobserve = function (obj, event, handler) {
			if (obj.removeEventListener) {
				obj.removeEventListener(event, handler, False);
			} else if (obj.detachEvent) {
				obj.detachEvent("on" + event, handler);
			}
		},
		clearChildren = function (node) {
			var children = node.childNodes,
			child = children.length;
		
			while (child--) {
				node.removeChild(children.item(0));
			}
		},
		setSafetyMargin = tinylog.setSafetyMargin = function (safetyMarginSetting) {
			useSafetyMargin = safetyMarginSetting;
		},
		
		createLog = function () {
		
		var originalPadding = docElemStyle.paddingBottom,
		container           = createElement($div),
		containerStyle      = container[$style],
		resizer             = append(container, createElement($div)),
		output              = append(container, createElement($div)),
		buttons             = append(container, createElement($div)),
		saveButton          = append(buttons, createElement("a")),
		saveImage           = append(saveButton, new Image()),
		closeButton         = append(buttons, createElement($div)),
		resizingLog         = False,
		previousHeight      = False,
		previousScrollTop,
		
		updateSafetyMargin = function () {
			// have a blank space large enough to fit the output box at the page bottom
			docElemStyle.paddingBottom = container.clientHeight + "px";
		},
		updateSavedLog = function () {
			saveImage.src = "data:image/gif;base64," + base64(blankGIF + encodeLog());
			changedSinceUpdate = False;
			saveButton.href =
				"data:application/x-tinylog;base64," +
				base64(encodeLog());
		},
		setContainerHeight = function (height) {
			var viewHeight = view.innerHeight,
			resizerHeight    = resizer.clientHeight;
		
			// constrain the container inside the viewport's dimensions
			if (height < 0) {
				height = 0;
			} else if (height + resizerHeight > viewHeight) {
				height = viewHeight - resizerHeight;
			}
			
			containerStyle.height = height + "px";
		
			if (useSafetyMargin) {
				updateSafetyMargin();
			}
		},
		clearLog = tinylog.clear = function () {
			clearChildren(output);
			entries.length = 0;
		},
		observers = [
			
			observer(doc, "mousemove", function (evt) {
				if (resizingLog) {
					setContainerHeight(view.innerHeight - evt.clientY);
					output.scrollTop = previousScrollTop;
				}
			}),
		
			observer(doc, "mouseup", function () {
				if (resizingLog) {
					resizingLog = previousScrollTop = False;
				}
			}),
			
			// minimize tinylog
			observer(resizer, "dblclick", function (evt) {
				evt.preventDefault();
				if (previousHeight) {
					setContainerHeight(previousHeight);
					previousHeight = False;
				} else {
					previousHeight = container.clientHeight;
					containerStyle.height = "0px";
				}
			}),
			
			observer(resizer, "mousedown", function (evt) {
				evt.preventDefault();
				resizingLog = True;
				previousScrollTop = output.scrollTop;
			}),
			
			// fix resizing being stuck when context menu opens
			observer(resizer, "contextmenu", function () {
				resizingLog = False;
			}),
		
			observer(saveButton, "mouseover", function () {
				if (changedSinceUpdate) {
					updateSavedLog();
				}
			}),
		
			observer(closeButton, "click", function () {
				uninit();
			})
		
		];
		
		
		uninit = tinylog.uninit = function () {
			// remove observers
			var i = observers.length;
			
			while (i--) {
				unobserve.apply(tinylog, observers[i]);
			}
			
			// remove tinylog log from the DOM
			
			docElem.removeChild(container);
			docElemStyle.paddingBottom = originalPadding;
			
			clearLog();
			clearChildren(buttons);
			clearChildren(container);
			
			tinylog.postEntry = postEntry;
			tinylog.setEncodings = setEncodings;
			tinylog.setSafetyMargin = setSafetyMargin;
		};
		
		tinylog.setEncodings = function () {
			setEncodings.apply(tinylog, arguments);
			updateSavedLog();
		};
		
		tinylog.setSafetyMargin = function (safetyMarginSetting) {
			setSafetyMargin(safetyMarginSetting);
			updateSafetyMargin();
		};
		
		container[$class] = $tinylogSpace + $tinylog + "-container";
		
		output[$class] = $tinylogSpace + $tinylog + "-output";
		
		buttons[$class] = $tinylogSpace + $tinylog + "-buttons-container";
		
		saveButton[$class] = $tinylogSpace + $tinylog + "-button " + $saveButton;
		saveButton[$title] = l("Click or open a context menu here to save log");
		saveButton[$setAttr]($data + "symbol", "\u2B07");
		
		saveImage[$class]  = $tinylogSpace + $saveButton + "-image";
		updateSavedLog();
		
		closeButton[$class] = $tinylogSpace + $tinylog + "-button " + $tinylog +
		                        "-close-button";
		closeButton[$title] = l("Close Log");
		closeButton[$setAttr]($data + "symbol", "\u2716");
		
		resizer[$class] = $tinylogSpace + $tinylog + "-resizer";
		resizer[$title] = l("Double-click to toggle log minimization");
		
		return [container, output];
		
		},
		
		displayLog = tinylog.display = function () {
			var log = createLog(), // var [container, output] = createLog();
			container = log[0],
			output = log[1];
			
			tinylog.postEntry = function (date, message) {
				var entry = append(output, createElement($div)),
				entryText = append(entry, createElement($div));
			
				entry[$title] = date.toLocaleTimeString();
				entry[$class] = $tinylogEntry;
				entryText[$class] = $tinylogEntryText;
			
				storeEntry(date, message);
				changedSinceUpdate = True;
			
				append(entryText, createTextNode(message));
				output.scrollTop = output.scrollHeight;
			};
			
			append(docElem, container);
		};
		
		postEntry = tinylog.postEntry = function (date, message) {
			displayLog();
			tinylog.postEntry(date, message);
		};
	}()); } else if (typeof print === "function") { // JS console
		tinylog.postEntry = function (date, message) {
			storeEntry(date, message);
			print(message);
		};
	}

	if (!console.log) {
		console.log = tinylog.log;
	} else {
		try {
			// intercept all console.log calls
			// Firebug may have problems with redefining console.log
			consoleLog = console.log;
			console.log = function () {
				storeEntry(new Date(), slice(arguments).join(" "));
				consoleLog.apply(console, arguments);
			};
		} catch (e) {
			consoleLog = null;
		}
	}

}(tinylog, console));
