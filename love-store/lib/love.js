"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLove = void 0;
var applyMiddleware_1 = require("./applyMiddleware");
exports.makeLove = function (initialState) {
    var middleware = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middleware[_i - 1] = arguments[_i];
    }
    var stores = {};
    var observers = [];
    var silent = false;
    function notifyObservers(action) {
        var extraArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extraArgs[_i - 1] = arguments[_i];
        }
        if (!silent)
            observers.forEach(function (observer) { return observer.apply(void 0, __spread([action], extraArgs)); });
    }
    function getState() {
        return Object.entries(stores).reduce(function (acc, _a) {
            var _b;
            var _c = __read(_a, 2), key = _c[0], store = _c[1];
            return (__assign(__assign({}, acc), (_b = {}, _b[key] = store.state, _b)));
        }, {});
    }
    var loveDispatch = function (action) {
        var extraArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extraArgs[_i - 1] = arguments[_i];
        }
        silent = true;
        Object.values(stores).forEach(function (store) {
            return store.dispatch.apply(store, __spread([action], extraArgs));
        });
        silent = false;
        notifyObservers.apply(void 0, __spread([action], extraArgs));
        return action;
    };
    var dispatch = applyMiddleware_1.applyMiddleware.apply(void 0, __spread([{ getState: getState, dispatch: loveDispatch }], middleware));
    return {
        get stores() {
            return stores;
        },
        dispatch: dispatch,
        observe: function (observer) {
            observers.push(observer);
            return function () {
                observers = observers.filter(function (currentObserver) { return currentObserver !== observer; });
            };
        },
        registerStore: function (store) {
            if (!(store.name in stores)) {
                stores[store.name] = store;
                store.dispatch = applyMiddleware_1.applyMiddleware.apply(void 0, __spread([{ getState: getState, dispatch: store.dispatch }], middleware));
                store.observe(function (state, action) {
                    var extraArgs = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        extraArgs[_i - 2] = arguments[_i];
                    }
                    return notifyObservers.apply(void 0, __spread([action], extraArgs));
                });
                var savedState = initialState === null || initialState === void 0 ? void 0 : initialState[store.name];
                store.dispatch({ type: "@init", savedState: savedState });
            }
        },
        replaceStores: function (nextStores) {
            stores = nextStores;
        },
    };
};
//# sourceMappingURL=love.js.map