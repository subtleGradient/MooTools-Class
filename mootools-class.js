
/*
---
name: Core
description: The heart of MooTools.
provides: [Core, MooTools, Type, typeOf, instanceOf]
...
*/

(function(){

this.MooTools = {
	version: '1.99dev',
	build: ''
};

// nil

this.nil = function(item){
	return (item != null) ? item : null;
};

Function.prototype.overloadSetter = function(usePlural){
	var self = this;
	return function(a, b){
		if (usePlural || typeof a != 'string'){
			for (var k in a) self.call(this, k, a[k]);
		} else {
			self.call(this, a, b);
		}
		return this;
	};
};

Function.prototype.overloadGetter = function(usePlural){
	var self = this;
	return function(a){
		var args, result;
		if (usePlural || typeof a != 'string') args = a;
		else if (arguments.length > 1) args = arguments;
		if (args){
			result = {};
			for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
		} else {
			result = self.call(this, a);
		}
		return result;
	};
};

Function.prototype.extend = function(key, value){
	this[key] = value;
}.overloadSetter();

Function.prototype.implement = function(key, value){
	this.prototype[key] = value;
}.overloadSetter();

// typeOf, instanceOf

var typeOf = this.typeOf = function(item){
	if (item == null) return 'null';
	if (item.$family) return item.$family();
	
	if (item.nodeName){
		if (item.nodeType == 1) return 'element';
		if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
	} else if (typeof item.length == 'number'){
		if (item.callee) return 'arguments';
		if ('item' in item) return 'collection';
	}

	return typeof item;
};

var instanceOf = this.instanceOf = function(item, object){
	if (item == null) return false;
	var constructor = item.$constructor || item.constructor;
	if (object == null) return constructor;
	while (constructor){
		if (constructor === object) return true;
		constructor = constructor.parent;
	}
	return item instanceof object;
};

// From

Function.from = function(item){
	return (typeOf(item) == 'function') ? item : function(){
		return item;
	};
};

Array.from = function(item){
	if (item == null) return [];
	return (Type.isEnumerable(item)) ? (typeOf(item) == 'array') ? item : Array.prototype.slice.call(item) : [item];
};

Number.from = function(item){
	var number = parseFloat(item);
	return isFinite(number) ? number : null;
};

String.from = function(item){
	return item + '';
};

// hide, protect

Function.implement({
	
	hide: function(){
		this.$hidden = true;
		return this;
	},

	protect: function(){
		this.$protected = true;
		return this;
	}
	
});

// Type

var Type = this.Type = function(name, object){
	
	var lower = (name || '').toLowerCase();
	
	if (name) Type['is' + name] = function(item){
		return (typeOf(item) == lower);
	};
	
	if (object == null) return null;
	
	if (name){
		object.prototype.$family = function(){
			return lower;
		}.hide();
		object.$name = lower;
	}

	object.extend(this);
	object.$constructor = Type;
	object.prototype.$constructor = object;
	
	return object;
};

Type.isEnumerable = function(item){
	return (typeof item == 'object' && typeof item.length == 'number');
};

var hooks = {};

var hooksOf = function(object){
	var type = typeOf(object.prototype);
	return hooks[type] || (hooks[type] = []);
};

var implement = function(name, method){
	if (method && method.$hidden) return this;
	
	var hooks = hooksOf(this);
	
	for (var i = 0; i < hooks.length; i++){
		var hook = hooks[i];
		if (typeOf(hook) == 'type') implement.call(hook, name, method);
		else hook.call(this, name, method);
	}

	var previous = this.prototype[name];
	if (previous == null || !previous.$protected) this.prototype[name] = method;
	
	if (this[name] == null && typeOf(method) == 'function') extend.call(this, name, function(item){
		return method.apply(item, Array.prototype.slice.call(arguments, 1));
	});
	
	return this;
};

var extend = function(name, method){
	if (method && method.$hidden) return this;
	var previous = this[name];
	if (previous == null || !previous.$protected) this[name] = method;
	return this;
};

Type.implement({
	
	implement: implement.overloadSetter(),
	
	extend: extend.overloadSetter(),

	alias: function(key, value){
		implement.call(this, key, this.prototype[value]);
	}.overloadSetter(),

	mirror: function(hook){
		hooksOf(this).push(hook);
		return this;
	}
	
});

new Type('Type', Type);

// Default Types

var force = function(type, methods){
	var object = new Type(type, this[type]);
	
	var prototype = object.prototype;
	
	for (var i = 0, l = methods.length; i < l; i++){
		var name = methods[i];
		
		var generic = object[name];
		if (generic) generic.protect();
		
		var proto = prototype[name];
		if (proto){
			delete prototype[name];
			prototype[name] = proto.protect();
		}
	}
	
	return object.implement(object.prototype);
};

force('String', [
	'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
	'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
]);

force('Array', [
	'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
	'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
]);

force('Number', ['toExponential', 'toFixed', 'toLocaleString', 'toPrecision']);

force('Function', ['apply', 'call']);

force('RegExp', ['exec', 'test']);

force('Date', ['now']);

Date.extend('now', function(){
	return +(new Date);
});

new Type('Boolean', Boolean);

// fixes NaN returning as Number

Number.prototype.$family = function(){
	return (isFinite(this)) ? 'number' : 'null';
}.hide();

// forEach, each

Object.extend('forEach', function(object, fn, bind){
	for (var key in object) fn.call(bind, object[key], key, object);
});

Object.each = Object.forEach;

Array.implement('forEach', function(fn, bind){
	for (var i = 0, l = this.length; i < l; i++){
		if (i in this) fn.call(bind, this[i], i, this);
	}
}).alias('each', 'forEach');

// Array & Object cloning

var cloneOf = function(item){
	switch (typeOf(item)){
		case 'array': return item.clone();
		case 'object': return Object.clone(item);
		default: return item;
	}
};

Array.implement('clone', function(){
	var i = this.length, clone = new Array(i);
	while (i--) clone[i] = cloneOf(this[i]);
	return clone;
});

Object.extend('clone', function(object){
	var clone = {};
	for (var key in object) clone[key] = cloneOf(object[key]);
	return clone;
});

// Object merging

var merge = function(source, key, current){
	switch (typeOf(current)){
		case 'object':
			if (typeOf(source[key]) == 'object') Object.merge(source[key], current);
			else source[key] = Object.clone(current);
		break;
		case 'array': source[key] = current.clone(); break;
		default: source[key] = current;
	}
	return source;
};

Object.extend('merge', function(source, k, v){
	if (typeof k == 'string') return merge(source, k, v);
	for (var i = 1, l = arguments.length; i < l; i++){
		var object = arguments[i];
		for (var key in object) merge(source, key, object[key]);
	}
	return source;
});

// Object-less types

['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments'].each(function(name){
	Type(name);
});

// UID generator

var UID = 0;

this.uniqueID = function(){
	return (Date.now() + (UID++)).toString(36);
};

})();


/*
---
name: Array
description: Array prototypes and generics.
requires: Type
provides: Array
...
*/

Array.implement({

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},
	
	pair: function(fn, bind){
		var object = {};
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) object[this[i]] = fn.call(bind, this[i], i, this);
		}
		return object;
	},

	indexOf: function(item, from){
		for (var l = this.length, i = (from < 0) ? Math.max(0, l + from) : from || 0; i < l; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) results[i] = fn.call(bind, this[i], i, this);
		}
		return results;
	},
	
	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && !fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},
	
	clean: function(){
		return this.filter(function(item){
			return item != null;
		});
	},
	
	pick: function(){
		for (var i = 0, l = this.length; i < l; i++){
			if (this[i] != null) return this[i];
		}
		return null;
	},
	
	invoke: function(methodName){
		var args = Array.slice(arguments, 1), results = [];
		for (var i = 0, j = this.length; i < j; i++){
			var item = this[i];
			results.push(item[methodName].apply(item, args));
		}
		return results;
	},
	
	append: function(array){
		this.push.apply(this, array);
		return this;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	last: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	random: function(){
		return (this.length) ? this[Number.random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--; i){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},
	
	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var ti = this[i], t = typeOf(this[i]);
			if (t == 'null') continue;
			array = array.concat((t == 'array' || t == 'collection' || t == 'arguments' || instanceOf(ti, Array)) ? Array.flatten(ti) : ti);
		}
		return array;
	},

	item: function(at){
		if (at < 0) at = (at % this.length) + this.length;
		return (at < 0 || at >= this.length || this[at] == null) ? null : this[at];
	}

});


/*
---
name: String
description: String prototypes and generics.
requires: Type
provides: String
...
*/

String.implement({

	test: function(regex, params){
		return ((typeOf(regex) == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	contains: function(string, separator){
		return ((separator) ? (separator + this + separator).indexOf(separator + string + separator) : this.indexOf(string)) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return '-' + match.toLowerCase();
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != null) ? object[name] : '';
		});
	},
	
	toInt: function(base){
		return parseInt(this, base || 10);
	},
	
	toFloat: function(){
		return parseFloat(this);
	}

});


/*
---
name: Function
description: Function prototypes and generics.
requires: Type
provides: Function
...
*/

Function.extend({

	clear: function(timer){
		clearInterval(timer);
		clearTimeout(timer);
		return null;
	},

	stab: function(){
		for (var i = 0, l = arguments.length; i < l; i++){
			try {
				return arguments[i]();
			} catch (e){}
		}
		return null;
	}

});

Function.implement({

	attempt: function(args, bind){
		try {
			return this.apply(bind, Array.from(args));
		} catch (e){
			return null;
		}
	},

	bind: function(bind, args){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	},

	delay: function(delay, bind, args){
		return setTimeout(this.bind(bind, args), delay);
	},

	pass: function(args, bind){
		return this.bind(bind, args);
	},

	periodical: function(periodical, bind, args){
		return setInterval(this.bind(bind, args), periodical);
	},

	run: function(args, bind){
		return this.apply(bind, Array.from(args));
	}

});


/*
---
name: Number
description: Number prototypes and generics.
requires: Type
provides: Number
...
*/

Number.extend({
	
	random: function(min, max){
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	
	toInt: function(number, base){
		return parseInt(number, base || 10);
	},
	
	toFloat: function(number){
		return parseFloat(number);
	}

});

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, null, this);
	}

});

['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan'].each(function(name){
	Number.extend(name, Math[name]).implement(name, function(){
		return Math[name].apply(null, [this].concat(Array.slice(arguments)));
	});
});


/*
---
name: Object
description: Object generics
requires: Type
provides: Object
...
*/

Object.extend({
	
	length: function(object){
		var length = 0;
		for (var key in object) length++;
		return length;
	},
	
	from: function(keys, values){
		var object = {};
		for (var i = 0; i < keys.length; i++) object[keys[i]] = nil(values[i]);
		return object;
	},
	
	append: function(original){
		for (var i = 1; i < arguments.length; i++){
			var extended = arguments[i] || {};
			for (var key in extended) original[key] = extended[key];
		}
		return original;
	},
	
	subset: function(object, keys){
		var results = {};
		for (var i = 0, l = keys.length; i < l; i++){
			var k = keys[i], value = object[k];
			results[k] = nil(value);
		}
		return results;
	},
	
	map: function(object, fn, bind){
		var results = {};
		for (var key in object) results[key] = fn.call(bind, object[key], key, object);
		return results;
	},
	
	filter: function(object, fn, bind){
		var results = {};
		for (var key in object){
			if (fn.call(bind, object[key], key, object)) results[key] = object[key];
		}
		return results;
	},
	
	every: function(object, fn, bind){
		for (var key in object){
			if (!fn.call(bind, object[key], key)) return false;
		}
		return true;
	},
	
	some: function(object, fn, bind){
		for (var key in object){
			if (fn.call(bind, object[key], key)) return true;
		}
		return false;
	},
	
	keys: function(object){
		var keys = [];
		for (var key in object) keys.push(key);
		return keys;
	},
	
	values: function(object){
		var values = [];
		for (var key in object) values.push(object[key]);
		return values;
	}
	
});


/*
---
name: Accessor
description: Accessor
requires: [typeOf, Array, Function, String, Object]
provides: Accessor
...
*/

(function(global){

/* Accessor */

this.Accessor = function(singular, plural){
	
	singular = (singular || '').capitalize();
	if (!plural) plural = singular + 's';
	
	var define = 'define', lookup = 'lookup', match = 'match', each = 'each';
	
	if (this === global) return [define + singular, define + plural, lookup + singular, lookup + plural, match + singular, each + singular].pair(function(name){
		return function(){
			Object.append(this, new Accessor(singular, plural));
			return this[name].apply(this, arguments);
		};
	});
	
	var accessor = {}, matchers = [];
	
	this[define + singular] = function(key, value){
		if (typeOf(key) == 'regexp') matchers.push({'regexp': key, 'action': value});
		else accessor[key] = value;
		return this;
	};
	
	this[define + plural] = function(object){
		for (var key in object) accessor[key] = object[key];
		return this;
	};
	
	this[match + singular] = function(name){
		for (var l = matchers.length; l--; l){
			var matcher = matchers[l], match = name.match(matcher.regexp);
			if (match && (match = match.slice(1))) return function(){
				return matcher.action.apply(this, Array.slice(arguments).append(match));
			};
		}
		return null;
	};
	
	this[lookup + singular] = function(key){
		return accessor[key] || null;
	};
	
	this[lookup + plural] = function(keys){
		return Object.subset(accessor, keys);
	};
	
	this[each + singular] = function(fn, bind){
		for (var p in accessor) fn.call(bind, accessor[p], p);
	};
	
	return this;

};

})(this);


/*
---
name: Class
description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.
requires: [typeOf, instanceOf, Array, String, Function, Number, Accessor]
provides: Class
...
*/

(function(){

var Class = this.Class = new Type('Class', function(params){
	
	if (instanceOf(params, Function)) params = {'initialize': params};
	
	var newClass = function(){
		reset(this);
		if (newClass.$prototyping) return this;
		this.$caller = null;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		this.$caller = this.caller = null;
		return value;
	}.extend(this);

	newClass.implement(params);
	
	newClass.$constructor = Class;
	newClass.prototype.$constructor = newClass;
	newClass.prototype.parent = parent;

	return newClass;

});

var parent = function(){
	if (!this.$caller) throw new Error('The method "parent" cannot be called.');
	var name = this.$caller.$name, parent = this.$caller.$owner.parent;
	var previous = (parent) ? parent.prototype[name] : null;
	if (!previous) throw new Error('The method "' + name + '" has no parent.');
	return previous.apply(this, arguments);
};

var reset = function(object){
	for (var key in object){
		var value = object[key];
		switch (typeOf(value)){
			case 'object':
				var F = function(){};
				F.prototype = value;
				var instance = new F;
				object[key] = reset(instance);
			break;
			case 'array': object[key] = value.clone(); break;
		}
	}
	return object;
};

var wrap = function(self, key, method){
	if (method.$origin) method = method.$origin;
	
	return function(){
		if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');
		var caller = this.caller, current = this.$caller;
		this.caller = current; this.$caller = arguments.callee;
		var result = method.apply(this, arguments);
		this.$caller = current; this.caller = caller;
		return result;
	}.extend({$owner: self, $origin: method, $name: key});
};

Class.extend(new Accessor('Mutator'));

var implement = function(key, value, retainOwner){
	
	var mutator = Class.matchMutator(key) || Class.lookupMutator(key);
	
	if (mutator){
		value = mutator.call(this, value);
		if (value == null) return;
	}
	
	if (typeOf(value) == 'function'){
		if (value.$hidden) return;
		this.prototype[key] = (retainOwner) ? value : wrap(this, key, value);
	} else {
		Object.merge(this.prototype, key, value);
	}
	
};

var implementClass = function(item){
	var instance = new item;
	for (var key in instance) implement.call(this, key, instance[key], true);
};

Class.implement('implement', function(a, b){
	
	switch (typeOf(a)){
		case 'string': implement.call(this, a, b); break;
		case 'class': implementClass.call(this, a); break;
		default: for (var p in a) implement.call(this, p, a[p]); break;
	}
	
	return this;
	
});

Class.defineMutators({

	Extends: function(parent){
		this.parent = parent;
		parent.$prototyping = true;
		var proto = new parent;
		delete parent.$prototyping;
		this.prototype = proto;
	},

	Implements: function(items){
		Array.from(items).each(function(item){
			this.implement(item);
		}, this);
	}

});

Class.defineMutator(/^protected\s(\w+)$/, function(fn, name){
	implement.call(this, name, fn.protect());
});

Class.defineMutator(/^linked\s(\w+)$/, function(value, name){
	this.prototype[name] = value;
});

})();

