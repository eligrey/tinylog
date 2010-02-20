/*
 * tinylog lite JavaScript library
 *
 * 2010-02-19
 * 
 * By Elijah Grey, http://eligrey.com
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*global self */

/*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, regexp: true, strict: true,
newcap: true, immed: true, maxerr: 200 */

"use strict";

var tinylogLite = (function (self) {

	var tinylogLite = {},
	doc             = self.document,
	tinylog         = self.tinylog,
	console         = self.console,
	print           = self.print,
	False           = !1,
	True            = !0,
	log             = "log";
	
	if (console && console[log]) { // native console
		tinylogLite[log] = function (message) {
			console[log](message);
		};
	} else if (tinylog && tinylog[log]) { // pre-existing tinylog
		tinylogLite[log] = tinylog[log];
	} else if (doc) { (function () { // DOM document
		var
		
		$div   = "div",
		$style = "style",
		$title = "title",
		
		containerStyles = {
			zIndex: 10000,
			position: "fixed",
			bottom: "0px",
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
			top: "0px",
			right: "15px",
			border: "1px solid black",
			borderTop: "none",
			cursor: "pointer",
			fontWeight: "bold",
			textAlign: "center",
			padding: "1px 5px",
			backgroundColor: "#eb0000"
		},
		entryStyles = {
			borderBottom: "1px solid #d3d3d3",
			whiteSpace: "pre-wrap",
			minHeight: "16px",
			fontSize: "12px"
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
		originalPadding = docElemStyle.paddingBottom,
		container       = createElement($div),
		containerStyle  = container[$style],
		resizer         = append(container, createElement($div)),
		output          = append(container, createElement($div)),
		closeButton     = append(container, createElement($div)),
		draggingHandle  = False,
		previousSize    = False,
		
		updateSafetyMargin = function () {
			// have a blank space large enough to fit the output box at the page bottom
			docElemStyle.paddingBottom = container.clientHeight + "px";
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
		
			updateSafetyMargin();
		},
		observers = [
			
			observer(doc, "mousemove", function (evt) {
				if (draggingHandle) {
					setContainerSize(view.innerHeight - evt.clientY);
				}
			}),
		
			observer(doc, "mouseup", function () {
				draggingHandle = False;
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
			}),
			
			// fix resizing being stuck when context menu opens
			observer(resizer, "contextmenu", function () {
				draggingHandle = False;
			}),
		
			observer(closeButton, "click", function () {
				uninit();
			})
		
		];
		
		uninit = function () {
			// remove observers
			var i = observers.length;
			
			while (i--) {
				unobserve.apply(self, observers[i]);
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
		append(closeButton, createTextNode("X"));
		
		resizer[$title] = "Double-click here to toggle log minimization";
		
		docElem.insertBefore(container, docElem.firstChild);
		
		tinylogLite[log] = function (message) {
			var entry  = append(output, createElement($div));
			
			setStyles(entry, entryStyles);
			entry[$title] = (new Date()).toLocaleString();
			
			append(entry, createTextNode(message));
			output.scrollTop = output.scrollHeight;
		};
		
		tinylogLite[log](message);
		
	};
	
	}());
	
	} else if (print) { // JS shell
		tinylogLite[log] = print;
	}
	
	return tinylogLite;
}(self));
