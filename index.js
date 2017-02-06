var xtend = require('xtend')
var Scan = require('pull-scan')
var pushable = require('pull-pushable')
var S = require('pull-stream')

var effects = {
    foo: function (state, msg, ev) {
        msg.bar(ev + '!!!')
    }
}

function Model () {
    return ''
}
Model.update = {
    bar: function (state, ev) {
        return state + ev
    }
}

var model = Component(effects, Model)

S(
    model.msgs,
    model.store,
    S.log()
)

model.msgs.push.foo('hello')
model.msgs.push.bar(' hi')




function Messages (effects, update) {
    var p = pushable()
    var keys = Object.keys(xtend(effects, update))
    var push = keys.reduce(function (acc, k) {
        acc[k] = function (data) {
            p.push([k, data])
        }
        return acc
    }, {})

    function wrapper () {
        return p.apply(null, arguments)
    }
    wrapper.end = p.end
    wrapper.push = push
    return wrapper
}


function Component (effects, model) {
    var msgs = Messages(effects, model.update)
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
        })
    )

    stream.push = msgs.push
    stream.end = msgs.end

    return {
        msgs: stream,
        store: S(scan, S.through(_state => state = _state))
    }
}

