/*
---
name : JSSpec
description : Implementation of the public JSSpec API using the CommonJS Unit Test 1.0 API or QUnit
version : '0.1alpha'

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides :
- JSSpec
- describe
- value_of
- assert

# requires :
# - assert || QUnit || require('assert')
# - test/runner || sg-testrunner
...
*/

// resolve requires

if (typeof assert == 'undefined' && typeof QUnit != 'undefined') var assert = QUnit
if (typeof assert == 'undefined' && typeof require != 'undefined') var assert = require('assert')


// CommonJS Module

if (typeof exports == 'undefined') var exports = this

// provides JSSpec

exports.assert = assert
exports.JSSpec = exports
exports.Browser = {}
var hasOwnProperty = {}.hasOwnProperty
function NOP(){}

require.paths.unshift('.')

var run
try {
	run = exports.run = require('test').run
} catch(e){}
try {
	if (!exports.run) run = exports.run = require('test/runner').run
} catch(e){}
try {
	if (!exports.run) run = exports.run = require('sg-testrunner').run
} catch(e){}


function describeTest(test, before, after){
	return function(){ before() ; test() ; after() }
}

exports.describe = describe
function describe(context, specs, base){
	if (base) throw new Error("describe(,,base) is not implemented")
	
	var before =
			specs.before
		||	specs.beforeEach
		||	specs.before_each
		||	specs['before each']
		||	NOP
	
	var after  =
			specs.after
		||	specs.afterEach
		||	specs.after_each
		||	specs['after each']
		||	NOP
	
	var tests = {}
	
	tests.testBefore =
			specs.beforeAll
		||	specs.before_all
		||	specs['before all']
		||	NOP
	
	for (var name in specs){
		if (!hasOwnProperty.call(specs, name)) continue
		tests['test ' + name] = describeTest(specs[name], before, after)
	}
	
	tests.testAfter =
			specs.afterAll
		||	specs.after_all
		||	specs['after all']
		||	NOP
	
	describe.specs['test ' + context] = tests
	
	if (!describe.runManually){
		run(describe.specs)
		describe.specs = {}
	}
	
}
describe.specs = {}



exports.value_of = value_of
function value_of(actual){
	if (!(this instanceof value_of)) return new value_of(actual)
	this.actual = actual
}

value_of.should_fail             = function(fn, message){}
value_of.should_be               = assert.equal
value_of.should_be_true          = assert.ok
value_of.should_not_be           = function(actual, expected, message){}
value_of.should_be_empty         = function(actual, message){}
value_of.should_not_be_empty     = function(actual, message){}
value_of.should_be_true          = function(actual, message){}
value_of.should_be_false         = function(actual, message){}
value_of.should_be_null          = function(actual, message){}
value_of.should_be_undefined     = function(actual, message){}
value_of.should_not_be_null      = function(actual, message){}
value_of.should_not_be_undefined = function(actual, message){}
value_of.should_have             = function(actual, expected, message){}
value_of.should_have_exactly     = function(actual, expected, message){}
value_of.should_have_at_least    = function(actual, expected, message){}
value_of.should_have_at_most     = function(actual, expected, message){}
value_of.should_include          = function(actual, expected, message){}
value_of.should_not_include      = function(actual, expected, message){}
value_of.should_match            = function(actual, expected, message){}
value_of.should_not_match        = function(actual, expected, message){}
value_of.getType                 = function(actual){}


for (var methodName in value_of){
	if (!hasOwnProperty.call(value_of, methodName)) continue
	value_of.prototype[methodName] = passArgumentFromThis(value_of[methodName], 'actual')
}

/*
function passArgument(fn, propertyNames){
	var a = propertyNames
	var undefined = void+0
	return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20){
		if (a[1] === undefined) a1 = a[1]
		return fn(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20)
	}
}
*/
function passArgumentFromThis(fn, propertyName){
	return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20){
		return fn(this[propertyName], a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20)
	}
}


// export to GLOBAL

if (typeof GLOBAL != 'undefined') var Global = GLOBAL
else var Global = this

Global.describe = describe
Global.value_of = value_of

