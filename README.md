# XBind.js

* Based on object.watch polyfill by Eli Gray, (http://eligray.com)
* License: MIT/GPLv2

XBind.js is a very simple JavaScript library that allows you to bind properties of POCO (Plain Old Class Objects) to
HTML DOM elements like input or select boxes. Once bound any change on one or the other will automatically update the
other.

Features Include:
* Change tracking
* Custom validation
* Integration with other frameworks, including jQuery
* Easy object-wide unbinding

## Simple Example
```	// Model Type Definition
	function person() {
		var FName;
		var LName;
	}

	p.bind({ prop: "FName", element: document.getElementById("fname") });
	p.bind({ prop: "LName", element: document.getElementById("lname") });
```

## Using with jQuery
jQuery does not pass actual DOM elements so we either have to use `$('#myobj').get(0)` or `$('#myobj')[0]` to work with 
no modifications. You can, however, override the default functions so that jQuery can be used nativly, as shown below.

```	// Use jQuery getters and setters / global override
	xbind.defaultget = function (element) { return $(element).val(); };
	xbind.defaultset = function (element, value) { $(element).val(value); };
	xbind.defaultchange = function (element, handler) { $(element).change(handler); };
	xbind.defaultunbindelement = function (element) { $(element).unbind('change'); };
	xbind.defaultvalidate = function (element, oldvalue, newvalue) {
		// Example Default Validation
		var valid = $(element).val().length > 0 && $(element)[0].checkValidity();
		if (!valid) {
			$(element).addClass('error');
			$(element).attr('title', 'This is a required field!');
		} else {
			$(element).removeClass('error');
			$(element).attr('title', '');
		}
		return true;
	};
```

## Support
Should work with all modern browsers. Older instances of IE may require the Shim and/or Sham libraries -- even then it's untested.