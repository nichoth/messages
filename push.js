var Ev = require('event-manifest/event')
var Pushable = require('pull-pushable')

function Push (keys) {
    var p = Pushable()
    var push = {}

    keys.forEach(function (k) {
        push[k] = function (arg) {
            p.push(Ev(k, arg))
        }
    })

    function wrapper () {
        return p.apply(null, arguments)
    }
    wrapper.push = push
    wrapper.end = p.end.bind(p)
    return wrapper
}

module.exports = Push

