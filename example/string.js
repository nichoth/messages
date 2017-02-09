var S = require('pull-stream')
var async = require('pull-async')
// var pushable = require('pull-pushable')
var cat = require('pull-cat')
// var Component = require('../model')

function StringModel () {
    return ''
}

StringModel.update = {
    bar: function (state, ev) {
        return state + ev
    },
    start: (state, ev) => state + ' resolving',
    resolve: (state, ev) => state.replace(' resolving', '')
}

StringModel.effects = {
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

module.exports = StringModel

