//
// Helper functions
//

var ws = ws || {};

/**
 * Adds all missing properties from second obj to first obj
 */
ws.extend = function(first, second, options){
    for (var prop in second){
        first[prop] = second[prop];
    }
};

/**
 * Pretty much the same as extend except it checks if value is undefined or NaN
 *   if new value is, ignore it
 */
ws.extend_clean = function(first, second, options){
    for (var prop in second){
	if (typeof(second[prop]) === "undefined" || second[prop] === null || Number.isNaN(second[prop])) {
	    continue;
	}

	if (typeof second[prop] === "object" && typeof first[prop] === "object") {
		ws.extend_clean(first[prop], second[prop]);
	} else {
        	first[prop] = second[prop];
	}

    }
};

/**
 * Returns a bool from a string representing a bool
 *
 */
ws.parseBool = function(value) {
	if (value === 'true') {
		return true;
	} else if (value === 'false') {
		return false;
	} else {
		return undefined;
	}
}

/**
 * Searches for a given element in the array, returns -1 if it is not present.
 * @param {Number} [from] The index at which to begin the search
 */
ws.indexOf = function(arr, elt, from){
    if (arr.indexOf) return arr.indexOf(elt, from);

    from = from || 0;
    var len = arr.length;

    if (from < 0) from += len;

    for (; from < len; from++){
        if (from in arr && arr[from] === elt){
            return from;
        }
    }
    return -1;
};

ws.getUniqueId = (function(){
    var id = 0;
    return function(){ return id++; };
})();

//
// Browsers and platforms detection

ws.ie       = function(){ return navigator.userAgent.indexOf('MSIE') != -1; };
ws.safari   = function(){ return navigator.vendor != undefined && navigator.vendor.indexOf("Apple") != -1; };
ws.chrome   = function(){ return navigator.vendor != undefined && navigator.vendor.indexOf('Google') != -1; };
ws.firefox  = function(){ return (navigator.userAgent.indexOf('Mozilla') != -1 && navigator.vendor != undefined && navigator.vendor == ''); };
ws.windows  = function(){ return navigator.platform == "Win32"; };

//
// Events

/** Returns the function which detaches attached event */
ws.attach = function(element, type, fn){
    if (element.addEventListener){
        element.addEventListener(type, fn, false);
    } else if (element.attachEvent){
        element.attachEvent('on' + type, fn);
    }
    return function() {
      ws.detach(element, type, fn)
    }
};
ws.detach = function(element, type, fn){
    if (element.removeEventListener){
        element.removeEventListener(type, fn, false);
    } else if (element.attachEvent){
        element.detachEvent('on' + type, fn);
    }
};

ws.preventDefault = function(e){
    if (e.preventDefault){
        e.preventDefault();
    } else{
        e.returnValue = false;
    }
};

//
// Node manipulations

/**
 * Insert node a before node b.
 */
ws.insertBefore = function(a, b){
    b.parentNode.insertBefore(a, b);
};
ws.remove = function(element){
    element.parentNode.removeChild(element);
};

ws.contains = function(parent, descendant){
    // compareposition returns false in this case
    if (parent == descendant) return true;

    if (parent.contains){
        return parent.contains(descendant);
    } else {
        return !!(descendant.compareDocumentPosition(parent) & 8);
    }
};

/**
 * Creates and returns element from html string
 * Uses innerHTML to create an element
 */
ws.toElement = (function(){
    var div = document.createElement('div');
    return function(html){
        div.innerHTML = html;
        var element = div.firstChild;
        div.removeChild(element);
        return element;
    };
})();

//
// Node properties and attributes

/**
 * Sets styles for an element.
 * Fixes opacity in IE6-8.
 */
ws.css = function(element, styles){
    if (styles.opacity != null && typeof styles.opacity != 'undefined'){
        if (typeof element.style.opacity != 'string' && typeof(element.filters) != 'undefined'){
            styles.filter = 'alpha(opacity=' + Math.round(100 * styles.opacity) + ')';
        }
    }
    ws.extend(element.style, styles);
};
ws.hasClass = function(element, name){
    var re = new RegExp('(^| )' + name + '( |$)');
    return re.test(element.className);
};
ws.addClass = function(element, name){
    if (!ws.hasClass(element, name)){
        element.className += ' ' + name;
    }
};
ws.removeClass = function(element, name){
    var re = new RegExp('(^| )' + name + '( |$)');
    element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
};
ws.setText = function(element, text){
    element.innerText = text;
    element.textContent = text;
};

//
// Selecting elements

ws.children = function(element){
    var children = [],
    child = element.firstChild;

    while (child){
        if (child.nodeType == 1){
            children.push(child);
        }
        child = child.nextSibling;
    }

    return children;
};

ws.getAllChildren = function(element) {

    var children = [],
    child = element.firstChild;

    while (child){
        if (child.nodeType == 1) {

            children.push(child);

	    childClass = child.className;
	    childId = child.id;

	    // check to see if this has children
	    //   if so, make recursive call
	    if (child.childNodes.length > 0) {
		children = children.concat( ws.getAllChildren( child ) );
	    } // endif

        }// endif

        child = child.nextSibling;
    }

    return children;
};

ws.isArray = function( variable ) {
	if (Object.prototype.toString.call( variable ) === '[object Array]')
	  return true;
	else
	  return false;
}


// 
// Getting keys from an object

ws.objectKeys = function(object) {
	var keys = [];

	for(var key in object){
		keys.push(key);
	}

	return keys;
}

ws.getByClass = function(element, className){
    if (element.querySelectorAll){
        return element.querySelectorAll('.' + className);
    }

    var result = [];
    var candidates = element.getElementsByTagName("*");
    var len = candidates.length;

    for (var i = 0; i < len; i++){
        if (ws.hasClass(candidates[i], className)){
            result.push(candidates[i]);
        }
    }
    return result;
};

/**
 * obj2url() takes a json-object as argument and generates
 * a querystring. pretty much like jQuery.param()
 *
 * how to use:
 *
 *    `ws.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
 *
 * will result in:
 *
 *    `http://any.url/upload?otherParam=value&a=b&c=d`
 *
 * @param  Object JSON-Object
 * @param  String current querystring-part
 * @return String encoded querystring
 */
ws.obj2url = function(obj, temp, prefixDone){
    var uristrings = [],
        prefix = '&',
        add = function(nextObj, i){
            var nextTemp = temp
                ? (/\[\]$/.test(temp)) // prevent double-encoding
                   ? temp
                   : temp+'['+i+']'
                : i;
            if ((nextTemp != 'undefined') && (i != 'undefined')) {
                uristrings.push(
                    (typeof nextObj === 'object')
                        ? ws.obj2url(nextObj, nextTemp, true)
                        : (Object.prototype.toString.call(nextObj) === '[object Function]')
                            ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj())
                            : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj)
                );
            }
        };

    if (!prefixDone && temp) {
      prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? '' : '&' : '?';
      uristrings.push(temp);
      uristrings.push(ws.obj2url(obj));
    } else if ((Object.prototype.toString.call(obj) === '[object Array]') && (typeof obj != 'undefined') ) {
        // we wont use a for-in-loop on an array (performance)
        for (var i = 0, len = obj.length; i < len; ++i){
            add(obj[i], i);
        }
    } else if ((typeof obj != 'undefined') && (obj !== null) && (typeof obj === "object")){
        // for anything else but a scalar, we will use for-in-loop
        for (var i in obj){
            add(obj[i], i);
        }
    } else {
        uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(obj));
    }

    return uristrings.join(prefix)
                     .replace(/^&/, '')
                     .replace(/%20/g, '+');
};

/**
 * A generic module which supports object disposing in dispose() method.
 * */
ws.DisposeSupport = {
  _disposers: [],

  /** Run all registered disposers */
  dispose: function() {
    var disposer;
    while (disposer = this._disposers.shift()) {
      disposer();
    }
  },

  /** Add disposer to the collection */
  addDisposer: function(disposeFunction) {
    this._disposers.push(disposeFunction);
  },

  /** Attach event handler and register de-attacher as a disposer */
  _attach: function() {
    this.addDisposer(ws.attach.apply(this, arguments));
  }
};

ws.ElementMap = function(element) {

	var child = element.firstChild;

	while (child && child != null) {

		if (child.nodeType == 1) {

			childClass = child.className;
			childId = child.id;
			// childTag = child.tagName; don't need this quite yet

			// HANDLE ID
			if (childId !== "") {
				this._addChild(childId, child);
			}

			// HANDLE CLASS
			//
			// Cases:
			// 0) No class name
			// 1) Single class (no spaces)
			// 2) Multiple classes
			//
			if (childClass !== "") {
				class_split = childClass.split(' ');

				if (class_split.length == 1)
				  this._addChild(childClass, child);
				else {

					for(var i = 0; i < class_split.length; i++) {
					  this._addChild(class_split[i], child);
					}
				}
			}

			// check to see if this has children
			//   if so, make recursive call
			if (child.childNodes.length > 0) {
				//this.extendMap( ws.mapChildren( child ) );
				//

				// VERSION 1.0
				var childMap = new ws.ElementMap( child );
				this._extendMap( childMap );
			} // endif

		} // endif

		child = child.nextSibling;
	}
};

ws.ElementMap.prototype = {

	// Registers an element in the map
	//  should skip functions
	//  
	//  Makes array if not already an array
	//
	_addChild : function(key, child) {

		if (this[key] !== undefined) {

			// check if is array
			if ( ws.isArray( this[key]) ) {
			  this[key].push( child );
			}
			else { // make it an array

				// create array and fill it with values
				var array = [];
				array.push(this[key]);
				array.push(child);

				// replace
				this[key] = array;
			}
		}
		else {
		  this[key] = child;
		}
	},
	// Can extend this map with other maps
	//
	//   Used primarily to drill down into other elements
	//      But can also cross-pollinate with other 
	//      elements across DOM
	_extendMap : function(map) {

		for (var prop in map){

			// if not in 
			if (!this[prop]) {
			  this[prop] = map[prop];
			}
			else {
				
				if (ws.isArray(this[prop])) {

					// concat if array, push if not
					if (ws.isArray(map[prop])) {
					  this[prop].concat( map[prop] );
					}
					else {
					  this[prop].push( map[prop] );
					}

				} 
				else if (typeof this[prop] === 'function') {
				  continue;
				}
				else { // make a new array
				  
					var arr = [];
					arr.push( this[prop] );

					// concat if array, push if not
					if (ws.isArray(map[prop])) {
					  arr.concat( map[prop] );
					}
					else {
					  arr.push( map[prop] );
					}

					this[prop] = arr;

				} // end if

			} // end if 
		}
	}
};

ws.Autoloader = function(func) {

	var prev_load = window.onload;

	if (prev_load == undefined) {
		window.onload = func;
	}
	else {
		window.onload = function() {
			// execute first function
			if (prev_load) {
			  prev_load();
			}
			// execute new function
			func();
		}
	}
};

ws.DoubleLinkedList = function() {

	this.head = null;
}

ws.DoubleLinkedList.prototype = {

	_add : function(value) {
	
		if (this.head == null) {

			var node = new ws.ListNode(value);
			this.head = node;
		}
	},
	_getHead : function() {
		return this.head;
	}
}

ws.ListNode = function() {

	this.next = null;
	this.previous = null;
	this.value = null;
}

ws.ListNode.prototype = {

	// Attaches new node
	//   or replaces old one
	//
	_next : function() {
	  return this.next;
	},
	_previous : function() {
	  return this.previous;
	},
	_setPrevious : function(node) {

	},
	_append : function(node) {

		this.pointer = node;
		node._setPrevious(this);
	},
	_setValue : function(value) {
	  this.value = value;
	},
	_getValue : function(value) {
	  return this.value;
	}
}
