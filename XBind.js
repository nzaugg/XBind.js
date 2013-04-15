/*
 * XBind.js by Nate Zaugg, http://github.com/nzaugg/XBind.js
 * Easily bind POCO objects to HTML DOM elements.
 *	- Includes object.watch polyfill by Eli Grey, http://eligrey.com
 *
 * Copyright 2013
 * Released under the MIT license
 */

var xbind = {
	defaultget: function (element) { return element.value; },
	defaultset: function (element, value) { element.value = value; },
	defaultchange: function (element, handler) { element.onchange = handler; },
	defaultvalidate: function (element, oldvalue, newvalue) { return true; },
	defaultunbindelement: function (element) { element.onchange = null; }
};

(function () {
	"use strict";

	// object.bind
	if (!Object.prototype.bind) {
		Object.defineProperty(Object.prototype, "bind", {
			enumerable: false,
			configurable: true,
			writable: false,
			value: function (proto) {
				/// proto property definition:
				///		prop: Required. The property to bind to (as a string)
				///		element: Required. The HTML element to bind to (as an object)
				///		validate: Specialized validation logic
				///		get: Specialized get logic for the element object (function (element))
				///		set: Specialized set logic for the element object (function (element, value))
				///		change: Specialized logic for assiging a change handler for the element object (function (element, handler))
				///		unbind: Specialized logic for unbinding an element; typically undoing the change handler.

				var b = {}; // binding info
				var jsObj = this;
				b.property = proto.prop;
				b.element = proto.element;
				b.validate = proto.validate || xbind.defaultvalidate;
				b.get = proto.get || xbind.defaultget;
				b.set = proto.set || xbind.defaultset;
				b.change = proto.change || xbind.defaultchange;
				b.unbindelement = proto.unbindelement || xbind.defaultunbindelement;

				// function for changes in the DOM element
				b.domBinding = function () {
					if (b.element && jsObj)
					{
						var oldval = jsObj[b.property];
						var newval = b.get(b.element);
						if (b.validate(b.element, oldval, newval))
							jsObj[b.property] = newval;
						else
							b.set(b.element, oldval);
					}
				};

				// function for changes in the JS object
				b.jsBinding = function (id, oldval, newval) {
					if (b.element && b.get(b.element) != newval)
						if (b.validate(b.element, oldval, newval))
							b.set(b.element, newval);

					return b.get(b.element);
				};

				// Assign the functions
				b.change(b.element, b.domBinding);
				jsObj.watch(b.property, b.jsBinding);

				// Set initial property from the JS object
				if (b.element)
					b.set(b.element, jsObj[b.property]);

				// Keep the bindingInfo with the property
				if (!jsObj.bindingInfo)
					jsObj.bindingInfo = [];
				jsObj.bindingInfo.push(b);
			}
		});
	}

	// object.unbind
	if (!Object.prototype.unbind) {
		Object.defineProperty(Object.prototype, "unbind", {
			enumerable: false,
			configurable: true,
			writable: false,
			value: function () {
				var jsObj = this;
				for (var index = 0; index < jsObj.bindingInfo.length; index++) {
					var binding = jsObj.bindingInfo[index];

					// Undo DOM element function
					binding.unbindelement(binding.element);

					// Undo JS element function    
					jsObj.unwatch(binding.property);
				}
				delete jsObj.bindingInfo;
			}
		});
	}

	// object.watch
	if (!Object.prototype.watch) {
		Object.defineProperty(Object.prototype, "watch", {
			enumerable: false,
			configurable: true,
			writable: false,
			value: function (prop, handler) {
				var oldval = this[prop],
					newval = oldval,
					getter = function () {
						return newval;
					},
					setter = function (val) {
						oldval = newval;
						return newval = handler.call(this, prop, oldval, val);
					};

				if (delete this[prop]) {
					// can't watch constants
					Object.defineProperty(this, prop, {
						get: getter,
						set: setter,
						enumerable: true,
						configurable: true
					});
				}
			}
		});
	}

	// object.unwatch
	if (!Object.prototype.unwatch) {
		Object.defineProperty(Object.prototype, "unwatch", {
			enumerable: false,
			configurable: true,
			writable: false,
			value: function (prop) {
				var val = this[prop];
				delete this[prop]; // remove accessors
				this[prop] = val;
			}
		});
	}
})();