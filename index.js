var xtend = require('xtend')
var Scan = require('pull-scan')
var pushable = require('pull-pushable')
var S = require('pull-stream')



function Messages (a, b) {
    var p = pushable()
    var keys = Object.keys(xtend(a, b))
    var push = keys.reduce(function (acc, k) {
        acc[k] = function (data) {
            p.push([k, data])
        }
        return acc
    }, {})

    function wrapper () {
        return p.apply(null, arguments)
    }
    wrapper.end = p.end.bind(p)
    wrapper.push = push
    return wrapper
}

var effects = {
    foo: function (state, msg, ev) {
        msg.bar(ev + '!!!')
    }
}
function model () {
    return ''
}
model.update = {
    bar: function (state, ev) {
        return state + ev
    }
}
var msgs = Messages(effects, model.update)
var stream = Component(msgs, effects, model)

S(
    stream,
    S.log()
)

stream.push.foo('hello')

function Component (msgs, effects, model) {
    var state = model()
    var scan = Scan(function (_state, ev) {
        return model.update[ev[0]](_state, ev[1])
    }, state)

    var stream = S(
        msgs,
        S.through(function (ev) {
            var fn = effects[ev[0]]
            if (!fn) return
            fn(state, msgs.push, ev[1])
        }),
        S.filter(function (ev) {
            return (!effects[ev[0]])
        }),
        scan,
        S.through(_state => state = _state)
    )

    stream.push = msgs.push
    stream.end = msgs.end
    return stream
}

