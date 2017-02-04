var Ev = require('event-manifest/event')
var xtend = require('xtend')

function Message (effects, reducers) {
    var fns = xtend(effects, reducers)
    var keys = Object.keys(fns)

    var msgs = keys.reduce(function (acc, k) {
        acc[k] = Ev(k)
        return acc
    }, {})

    return msgs
}

module.exports = Message

