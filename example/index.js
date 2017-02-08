var S = require('pull-stream')
var async = require('pull-async')
var pushable = require('pull-pushable')
var cat = require('pull-cat')
var Component = require('../')

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

module.exports = Model
