/*
 * tinylog.js
 *
 * 2010-02-12
 * 
 * By Elijah Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*global console, print, document, Image, btoa, escape, unescape */

/*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 200 */

// JSLint note: Ignore the first three, all "Bad escapement", and "Missing '()' invoking
// a constructor" errors.

"use strict";

var tinylog = tinylog || {encoders:{}, decoders:{}},
    console = console || {};

(function (tinylog, console) {

	var undef    = "undefined",
	blankGIF     = "GIF89a\1\0\1\0\x91\xFF\0\xFF\xFF\xFF\0\0\0\xC0\xC0\xC0\0\0" +
		           "\0!\xF9\x04\1\0\0\2\0,\0\0\0\0\1\0\1\0\0\2\2T\1\0;",
	False        = !1,
	True         = !0,
	nullBytes    = /\0/g,
	log          = tinylog.logEntries = [],
	math         = Math,
	base64       = btoa,
	encoders     = tinylog.encoders,
	decoders     = tinylog.decoders,
	encodeUTF8   = function (data) {
		return unescape(encodeURIComponent(data));
	},
	decodeUTF8   = function (data) {
		return decodeURIComponent(escape(data));
	},
	storeEntry   = function (date, message) {
		log.push([
			math.floor(date.getTime() / 1000), // remove milliseconds
			message
		]);
	},
	serializeRawUInt = function (i) {
		var buffer = [],
		pos;
	
		pos = math.ceil(math.log(i) / math.log(2) / 8);
		buffer.push(pos); // int byte-length byte

		while (pos--) {
			buffer.push(i >>> pos * 8 & 0xFF);
		}

		return String.fromCharCode.apply(String, buffer);
	},
	rawLog = tinylog.raw = function (logData) {
		if (!logData) {
			logData = log;
		}
		
		var
		buffer = [],
		i      = 0,
		len    = logData.length;
		
		for (; i < len; i++) {
			buffer.push(
				serializeRawUInt(logData[i][0]) +
				// encode UTF-8 string
				encodeUTF8(logData[i][1].replace(nullBytes, ""))
			);
		}
		
		return buffer.join("\0") + "\0";
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
	uninit = tinylog.uninit = function () {
		tinylog.postEntry = storeEntry;
	},
	encodeLog = tinylog.encode = function (logData, encoding) {
		if (!logData) {
			logData = log;
		}
		
		if (!encoding) {
			encoding = tinylog.encoding;
		}
		
		encoding = encoding.split("+");
		
		for (var i = 0, len = encoding.length; i < len; i++) {
			if (encoders[encoding[i]]) {
				logData = encoders[encoding[i]](logData);
			} else {
				throw new Error("Unsupported encoding: " + encoding[i]);
			}
		}
		
		return logData;
	},
	createLog, consoleLog;
	
	tinylog.postEntry = storeEntry;
	
	tinylog.log = function () {
		tinylog.postEntry(new Date, Array.prototype.slice.call(arguments).join(" "));
	};
	
	tinylog.clear = function () {
		log.length = 0;
	};
	
	encoders.raw = function (log) {
		return "raw\0" + rawLog(log);
	};
	
	decoders.raw = function (data) {
		var
		log = [],
		len = data.length,
		pos = 0,
		match, date, bytes;
		
		while (pos < len) {
			date  = 0;
			bytes = data.charCodeAt(pos++) + pos;
			
			for (; pos < bytes; pos++) {
				date = date << 8 | data.charCodeAt(pos);
			}
			
			match = data.substr(pos).indexOf("\0");
			
			log.push([
				date * 1000, // convert seconds to milliseconds
				// decode UTF-8 string
				decodeUTF8(data.substr(pos++, match))
			]);
			
			pos += match;
		}
		
		return log;
	};
	
	encoders.json = function (log) {
		return "json\0" + encodeUTF8(JSON.stringify(log));
	};
	
	decoders.json = function (data) {
		var log = JSON.parse(decodeUTF8(data.substr(data.indexOf("json\0") + 1))),
		i = log.length;
		
		while (i--) {
			log[i][0] *= 1000; // convert seconds to milliseconds
		}
		
		return log;
	};
	
	if (!tinylog.encoding) {
		// by default use raw encoding
		tinylog.encoding = "raw";
	}
	
	tinylog.decode = function (data) {
		if (data.indexOf(blankGIF) !== -1) {
			data = data.substr(blankGIF.length);
		}
		
		var index = data.indexOf("\0"),
		encoding  = data.substr(0, index);
		
		if (decoders[encoding]) {
			return decoders[encoding](data.substr(index + 1));
		} else {
			throw new Error("Unsupported encoding: " + encoding);
		}
	};
	
	if (console.log && tinylog.USE_NATIVE !== False) {
		tinylog.postEntry = function (date, message) {
			storeEntry(date, message);
			console.log(message);
		};
	} else if (typeof document !== undef) { // DOM document
		createLog = tinylog.postEntry = function (date, message) {
		// don't show output log until called once
		
		var doc = document,
		view    = doc.defaultView,
		docElem = doc.documentElement,
		
		$div          = "div",
		$style        = "style",
		$class        = "className",
		$data         = "data-",
		$title        = "title",
		$tinylog      = "tinylog",
		$tinylogSpace = $tinylog + " ",
		$saveButton   = $tinylog + "-save-button",
		
		containerNotResizing = $tinylogSpace + $tinylog + "-container",
		containerResizing    = containerNotResizing + " " + $tinylog + "-resizing",
		
		append = function (to, elem) {
			return to.appendChild(elem);
		},
		createElement = function (localName) {
			return doc.createElement(localName);
		},
		createTextNode = function (text) {
			return doc.createTextNode(text);
		},
		setAttr = function (elem, attr, val) {
			elem.setAttribute(attr, val);
		},
		
		docElemStyle         = docElem[$style],
		originalPadding      = docElemStyle.paddingBottom,
		container            = createElement($div),
		containerStyle       = container[$style],
		resizer              = append(container, createElement($div)),
		output               = append(container, createElement($div)),
		buttons              = append(container, createElement($div)),
		saveButton           = append(buttons, createElement($div)),
		saveImage            = append(saveButton, new Image),
		closeButton          = append(buttons, createElement($div)),
		draggingHandle       = False,
		previousSize         = False,
		lastEncoding         = tinylog.encoding,
		changedSinceUpdate   = True,
		previousScrollTop,
		
		updateSafetyMargin = function () {
			// have a blank space large enough to fit the output box at the page bottom
			docElemStyle.paddingBottom = container.clientHeight + "px";
		},
		updateSavedLog  = function () {
			if (changedSinceUpdate || lastEncoding !== tinylog.encoding) {
				saveImage.src = "data:image/gif;base64," + base64(blankGIF + encodeLog());
				changedSinceUpdate = False;
				lastEncoding       = tinylog.encoding;
			}
		},
		setContainerSize = function (height) {
			var viewHeight = view.innerHeight,
			resizerHeight  = resizer.clientHeight;
		
			// constrain the container inside the viewport's dimensions
			if (height < 0) {
				height = 0;
			} else if (height + resizerHeight > viewHeight) {
				height = viewHeight - resizerHeight;
			}
			
			containerStyle.height = height / viewHeight * 100 + "%";
		
			if (tinylog.SAFETY_MARGIN !== False) {
				updateSafetyMargin();
			}
		},
		clearLog = tinylog.clear = function () {
			clearChildren(output);
			log.length = 0;
		},
		observers = [
			
			observer(doc, "mousemove", function (evt) {
				if (draggingHandle) {
					setContainerSize(view.innerHeight - evt.clientY);
				}
			}),
		
			observer(doc, "mouseup", function () {
				if (draggingHandle) {
					draggingHandle = False;
					container[$class] = containerNotResizing;
					output.scrollTop = previousScrollTop;
				}
			}),
			
			// minimize tinylog
			observer(resizer, "dblclick", function (evt) {
				evt.preventDefault();
				if (previousSize) {
					setContainerSize(previousSize);
					previousSize = False;
				} else {
					previousSize = container.clientHeight;
					containerStyle.height = "0px";
				}
			}),
			
			observer(resizer, "mousedown", function (evt) {
				evt.preventDefault();
				draggingHandle = True;
				previousScrollTop = output.scrollTop;
				container[$class] = containerResizing;
			}),
			
			// fix resizing being stuck when context menu opens
			observer(resizer, "contextmenu", function () {
				draggingHandle = False;
			}),
		
			observer(saveButton, "mouseover", function () {
				updateSavedLog();
			}),
		
			// open saved log
			observer(saveButton, "click", function (evt) {
				evt.preventDefault();
				view.location.href =
					"data:application/vnd.sephr.tinylog;base64," +
					base64(encodeLog());
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
			
			tinylog.postEntry = createLog;
		};
		
		container[$class] = containerNotResizing;
		
		output[$class] = $tinylogSpace + $tinylog + "-output";
		
		buttons[$class] = $tinylogSpace + $tinylog + "-buttons-container";
		
		saveButton[$class] = $tinylogSpace + $tinylog + "-button " + $saveButton;
		saveButton[$title]     = "Click or open a context menu here to save log";
		setAttr(saveButton, $data + "symbol", "\u2B07");
		
		saveImage[$class]  = $tinylogSpace + $saveButton + "-image";
		updateSavedLog();
		
		closeButton[$class] = $tinylogSpace + $tinylog + "-button " + $tinylog +
		                        "-close-button";
		closeButton[$title]     = "Close Log";
		setAttr(closeButton, $data + "symbol", "X");
		
		resizer[$class] = $tinylogSpace + $tinylog + "-resizer";
		resizer[$title]     = "Double click here to toggle log minimization";
		
		docElem.insertBefore(container, docElem.firstChild);
		
		tinylog.postEntry = function (date, message) {
			var entry  = append(output, createElement($div));
			
			entry[$title] = date.toLocaleString();
			setAttr(entry, $data + "time", date.toLocaleTimeString());
			entry[$class] = "tinylog tinylog-entry";
			
			storeEntry(date, message);
			changedSinceUpdate = True;
			append(entry, createTextNode(message));
			output.scrollTop = output.scrollHeight;
		};
		
		if (tinylog.SAFETY_MARGIN !== False) {
			updateSafetyMargin();
			observers.push(observer(view, "resize", updateSafetyMargin));
		}
		
		if (!tinylog.AUTO_DISPLAY) {
			tinylog.postEntry(date, message);
		}
		
		};
		
		if (tinylog.AUTO_DISPLAY) {
			tinylog.postEntry();
		}
	} else if (typeof print === "function") { // JS console
		tinylog.postEntry = function (date, message) {
			storeEntry(date, message);
			print(message);
		};
	}

	if (!console.log) {
		console.log = tinylog.log;
	} else {
		consoleLog = console.log;
		try { // intercept all console.log calls
			// Firebug may have problems with redefining console.log
			console.log = function () {
				storeEntry(new Date, Array.prototype.slice.call(arguments).join(" "));
				consoleLog.apply(console, arguments);
			};
		} catch (e) {}
	}

}(tinylog, console));
