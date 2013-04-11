/*
 * XBind.js by Nate Zaugg, http://github.com/nzaugg/XBind.js
 * Easily bind POCO objects to HTML DOM elements.
 * Includes object.watch polyfill by Eli Grey, http://eligrey.com

 * Copyright 2013
 * Released under the MIT license
 */

var xbind = function() {
	// default get function
	var defaultGetFunction = function(element) { return element.value; };
	
	// default set function
	var defaultSetFunction = function(element, value) { element.value = value; };

	// The Bind function
	function bind(jsObj, jsProp, htmlElement, validationFunc, getFunc, setFunc) {
		var bindingInfo = {};
		bindingInfo.property = jsProp;
		bindingInfo.validationFunc = validationFunc;
		bindingInfo.htmlElement = htmlElement;
		bindingInfo.getFunc = getFunc || defaultGetFunction;
		bindingInfo.setFunc = setFunc || defaultSetFunction;
		
		// function for changes in the DOM element
		bindingInfo.domBinding = function() {
			if (htmlElement && jsObj)
				jsObj[jsProp] = bindingInfo.getFunc(htmlElement);
		};
		
		// function for changes in the JS object
		bindingInfo.jsBinding = function(id, oldval, newval) {
			if (htmlElement && bindingInfo.getFunc(htmlElement) != newval)
			   bindingInfo.setFunc(htmlElement, newval);

			return newval;
		};
		
		// Assign the functions
		htmlElement.onchange = bindingInfo.domBinding;
		jsObj.watch(jsProp, bindingInfo.jsBinding);
					
		// Set initial property from the JS object
		if (htmlElement)
			bindingInfo.setFunc(htmlElement, jsObj[jsProp]);
		
		// Keep the bindingInfo with the property
		if (!jsObj.bindingInfo)
			jsObj.bindingInfo = [];
		jsObj.bindingInfo.push(bindingInfo);
	}

	// the Unbind function
	function unbind(jsObj) {
		for(var index=0; index<jsObj.bindingInfo.length; index++) {
			var binding = jsObj.bindingInfo[index];
			
			// Undo DOM element function
			binding.htmlElement.onchange = null;
			
			// Undo JS element function    
			jsObj.unwatch(binding.property);
		}
		delete jsObj.bindingInfo;
	}
	
	
	// object.watch
	if (!Object.prototype.watch) {
		Object.defineProperty(Object.prototype, "watch", {
			  enumerable: false
			, configurable: true
			, writable: false
			, value: function (prop, handler) {
				var
				  oldval = this[prop]
				, newval = oldval
				, getter = function () {
					return newval;
				}
				, setter = function (val) {
					oldval = newval;
					return newval = handler.call(this, prop, oldval, val);
				}
				;
				
				if (delete this[prop]) { // can't watch constants
					Object.defineProperty(this, prop, {
						  get: getter
						, set: setter
						, enumerable: true
						, configurable: true
					});
				}
			}
		});
	}

	// object.unwatch
	if (!Object.prototype.unwatch) {
		Object.defineProperty(Object.prototype, "unwatch", {
			  enumerable: false
			, configurable: true
			, writable: false
			, value: function (prop) {
				var val = this[prop];
				delete this[prop]; // remove accessors
				this[prop] = val;
			}
		});
	}
}