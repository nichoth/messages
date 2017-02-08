var Model = require('../example')
var S = require('pull-stream')
var pushable = require('pull-pushable')
var mxtend = require('xtend/mutable')
var Component = require('../')
var noop = function () {}
var h = noop

App(h, noop)({
    model: Model(),
    update: Model.update,
    effects: Model.effects,
    subs: Model.subs,
    view: Model.view
})

function App (h, render, viewAdapter) {
    viewAdapter = viewAdapter || function () {
        return arguments
    }

    return function appLoop (component) {
        var model = Component(mxtend(component.model, component))
        var init = component.model()
        var p = pushable()
        var push = Object.keys(model.msg).reduce(function (acc, k) {
            acc[k] = function (data) {
                p.push([k, data])
            }
            return acc
        }, {})

        render(component.view.apply(null, viewAdapter(init, push)))

        S(
            S(p, model.effects),
            model.store,
            S.drain(function onEvent (ev) {
                render(component.view.apply(null, viewAdapter(ev, push)))
            }, function onEnd (err) {
                // should not happen
                console.log('end', err)
            })
        )
    }
}

