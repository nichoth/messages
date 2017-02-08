var xtend = require('xtend')
var async = require('pull-async')
var pushable = require('pull-pushable')
var cat = require('pull-cat')
// var many = require('pull-many')
var flatMerge = require('pull-flat-merge')
var Scan = require('pull-scan')
var S = require('pull-stream')

function Model () {
    return ''
}
Model.update = {
    bar: function (state, ev) {
        return state + ev
    },
    start: (state, ev) => state + ' resolving',
    resolve: (state, ev) => state.replace(' resolving', '')
}

Model.effects = {
    foo: function (state, msg, ev) {
        return msg.bar(ev + '!!!')
    },
    asyncThing: function (state, msg, ev) {
        return cat([
            S.once(msg.start()),
            async(function (cb) {
                setTimeout(function () {
                    cb(null, msg.resolve())
                }, 500)
            })
        ])
    }
}


var model = Component(Model)
var p = pushable()
S(
    S(p, model.effects()),
    model.store,
    S.log()
)

p.push(model.msg.foo('hello'))
p.push(model.msg.bar(' hi'))
p.push(model.msg.asyncThing())
p.end()

function Messages (effects, update) {
    var keys = Object.keys(xtend(update, effects))
    var msgs = keys.reduce(function (acc, k) {
        acc[k] = function (data) {
            return [k, data]
        }
        return acc
    }, {})
    return msgs
}

function Component (model) {
    var effects = model.effects
    var msgs = Messages(effects, model.update)
    var state = model()
    var scan = Scan(function (_state, ev) {
        return model.update[ev[0]](_state, ev[1])
    }, state)

    function fxStream () {
        var stream = S(
            flatMerge(),
            S.map(function (ev) {
                var fn = effects[ev[0]]
                if (!fn) return ev
                return fn(state, msgs, ev[1])
            }),
            flatMerge()
        )
        return stream
    }

    var store = S(scan, S.through(_state => state = _state))

    return {
        effects: fxStream,
        store: store,
        msg: msgs
    }
}

module.exports = Component
