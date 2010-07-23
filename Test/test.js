
require.paths.unshift('.')
require.paths.unshift('..')
require.paths.unshift('./lib')
require.paths.unshift('./Test/lib')

require('mootools-class')
require('JSSpec')
require('./Class.test')
