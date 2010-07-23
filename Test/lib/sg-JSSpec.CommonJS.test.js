var	JSSpec = require('./sg-JSSpec.CommonJS')
,	value_of = JSSpec.value_of
,	describe = JSSpec.describe

describe('JSSpec Basics', {
	before: function(){}
	,after: function(){}
	
	,"value_of() Should respond to should_be": function(){
		value_of(
			typeof value_of(true).should_be
		)
		.should_be('function')
	}
	
	,"value_of() Should respond to should_be_true": function(){
		value_of(
			typeof value_of(true).should_be_true
		)
		.should_be('function')
	}
	
	,"Should error": function(){
		++ DOES_NOT_EXIST
	}
	
	
	,"should_fail":function(){
		value_of(function(){}).should_fail()
	}
	,"should_be":function(){
		value_of(1).should_be(2)
	}
	,"should_be_true":function(){
		value_of(false).should_be_true()
	}
	,"should_not_be":function(){
		value_of(false).should_not_be(false)
	}
	,"should_be_empty":function(){
		value_of([1,2,3]).should_be_empty()
	}
	,"should_not_be_empty":function(){
		value_of().should_not_be_empty()
	}
	,"should_be_true":function(){
		value_of().should_be_true()
	}
	,"should_be_false":function(){
		value_of().should_be_false()
	}
	,"should_be_null":function(){
		value_of().should_be_null()
	}
	,"should_be_undefined":function(){
		value_of().should_be_undefined()
	}
	,"should_not_be_null":function(){
		value_of().should_not_be_null()
	}
	,"should_not_be_undefined":function(){
		value_of().should_not_be_undefined()
	}
	,"should_have":function(){
		value_of().should_have()
	}
	,"should_have_exactly":function(){
		value_of().should_have_exactly()
	}
	,"should_have_at_least":function(){
		value_of().should_have_at_least()
	}
	,"should_have_at_most":function(){
		value_of().should_have_at_most()
	}
	,"should_include":function(){
		value_of().should_include()
	}
	,"should_not_include":function(){
		value_of().should_not_include()
	}
	,"should_match":function(){
		value_of().should_match()
	}
	,"should_not_match":function(){
		value_of().should_not_match()
	}
	,"getType":function(){
		value_of().getType()
	}
	
})

