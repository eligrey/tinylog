/*
 * tinylog lite JavaScript library
 *
 * 2010-03-16
 * 
 * By Elijah Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*global console, tinylog, document, print */

/*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, regexp: true,
newcap: true, immed: true, maxerr: 200 */

var tinylogLite = (function () {
	"use strict";

	var tinylogLite = {},
	undef           = "undefined",
	func            = "function",
	False           = !1,
	True            = !0,
	log             = "log";
	
	if (typeof console !== undef && typeof console[log] === func) { // native console
		tinylogLite[log] = function (message) {
			console[log](message);
		};
	} else if (typeof tinylog !== undef && typeof tinylog[log] === func) {
		// pre-existing tinylog present
		tinylogLite[log] = tinylog[log];
	} else if (typeof document !== undef) { (function () { // DOM document
		var doc = document,
		
		$div   = "div",
		$style = "style",
		$title = "title",
		
		containerStyles = {
			zIndex: 10000,
			position: "fixed",
			bottom: 0,
			width: "100%",
			height: "15%",
			fontFamily: "sans-serif",
			color: "black",
			backgroundColor: "white"
		},
		outputStyles = {
			position: "relative",
			fontFamily: "monospace",
			overflow: "auto",
			height: "100%"
		},
		resizerStyles = {
			height: "5px",
			marginTop: "-5px",
			cursor: "n-resize",
			backgroundColor: "darkgrey"
		},
		closeButtonStyles = {
			position: "absolute",
			top: 0,
			right: "18px",
			cursor: "pointer",
			color: "white",
			backgroundColor: "#bbb",
			textAlign: "center",
			padding: "2px 6px 6px",
			MozBorderRadius: "4px",
			borderRadius: "4px",
			marginTop: "2px",
			fontSize: "14px",
			width: "12px",
			height: "12px"
		},
		entryStyles = {
			borderBottom: "1px solid #d3d3d3",
			minHeight: "16px"
		},
		entryTextStyles = {
			fontSize: "12px",
			margin: "1px 5px 0 5px",
			maxWidth: "100%",
			whiteSpace: "pre-wrap",
			overflow: "auto"
		},
		
		view         = doc.defaultView,
		docElem      = doc.documentElement,
		docElemStyle = docElem[$style],
		
		setStyles = function () {
			var i = arguments.length,
			elemStyle, styles, style;
			
			while (i--) {
				styles    = arguments[i--];
				elemStyle = arguments[i][$style];
			
				for (style in styles) {
					if (styles.hasOwnProperty(style)) {
						elemStyle[style] = styles[style];
					}
				}
			}
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
		append = function (to, elem) {
			return to.appendChild(elem);
		},
		createElement = function (localName) {
			return doc.createElement(localName);
		},
		createTextNode = function (text) {
			return doc.createTextNode(text);
		},
		
		createLog = tinylogLite[log] = function (message) {
		// don't show output log until called once
		
		var 
		uninit,
		originalPadding   = docElemStyle.paddingBottom,
		container         = createElement($div),
		containerStyle    = container[$style],
		resizer           = append(container, createElement($div)),
		output            = append(container, createElement($div)),
		closeButton       = append(container, createElement($div)),
		resizingLog       = False,
		previousHeight    = False,
		previousScrollTop = False,
		
		updateSafetyMargin = function () {
			// have a blank space large enough to fit the output box at the page bottom
			docElemStyle.paddingBottom = container.clientHeight + "px";
		},
		setContainerHeight = function (height) {
			var viewHeight = view.innerHeight,
			resizerHeight  = resizer.clientHeight;
		
			// constrain the container inside the viewport's dimensions
			if (height < 0) {
				height = 0;
			} else if (height + resizerHeight > viewHeight) {
				height = viewHeight - resizerHeight;
			}
			
			containerStyle.height = height / viewHeight * 100 + "%";
		
			updateSafetyMargin();
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
					containerStyle.height = 0;
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
		
			observer(closeButton, "click", function () {
				uninit();
			})
		
		];
		
		uninit = function () {
			// remove observers
			var i = observers.length;
			
			while (i--) {
				unobserve.apply(tinylogLite, observers[i]);
			}
			
			// remove tinylog lite from the DOM
			
			docElem.removeChild(container);
			docElemStyle.paddingBottom = originalPadding;
			
			clearChildren(output);
			clearChildren(container);
			
			tinylogLite[log] = createLog;
		};
		
		setStyles(
			container,   containerStyles,
			output,      outputStyles,
			resizer,     resizerStyles,
			closeButton, closeButtonStyles
		);
		
		closeButton[$title] = "Close Log";
		append(closeButton, createTextNode("\u2716"));
		
		resizer[$title] = "Double-click to toggle log minimization";
		
		docElem.insertBefore(container, docElem.firstChild);
		
		tinylogLite[log] = function (message) {
			var entry = append(output, createElement($div)),
			entryText = append(entry, createElement($div));
			
			entry[$title] = (new Date()).toLocaleTimeString();
			
			setStyles(
				entry,     entryStyles,
				entryText, entryTextStyles
			);
			
			append(entryText, createTextNode(message));
			output.scrollTop = output.scrollHeight;
		};
		
		tinylogLite[log](message);
		
	};
	
	}());
	
	} else if (typeof print === func) { // JS shell
		tinylogLite[log] = print;
	}
	
	return tinylogLite;
}());
