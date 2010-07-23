
require.paths.unshift('.')
require.paths.unshift('..')
require.paths.unshift('./lib')
require.paths.unshift('./Test/lib')

require('mootools-class')
require('sg-JSSpec.CommonJS')
require('./Class.test')
