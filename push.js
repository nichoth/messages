var Ev = require('event-manifest/event')
var Pushable = require('pull-pushable')

function Push (keys) {
    var p = Pushable()
    var push = keys.reduce(function (acc, k) {
        acc[k] = function (arg) {
            p.push(Ev(k, arg))
        }
        return acc
    }, {})
    return push
}

module.exports = Push

