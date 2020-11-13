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
exports.makeStore = void 0;
exports.makeStore = function (name, defaultState) {
    var observers = [];
    var state;
    function setState(nextState) {
        state = Object.freeze(nextState);
    }
    var actionHandlers = {
        "@init": function (_a) {
            var savedState = _a.savedState;
            if (typeof savedState !== "undefined")
                setState(savedState);
            return state;
        },
    };
    setState(defaultState);
    var dispatch = function (action) {
        var extraArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extraArgs[_i - 1] = arguments[_i];
        }
        var actionHandler = actionHandlers[action.type];
        if (actionHandler) {
            var nextState = actionHandler(action);
            setState(nextState);
            observers.forEach(function (observer) { return observer.apply(void 0, __spread([state, action], extraArgs)); });
        }
        return action;
    };
    return {
        get dispatch() {
            return dispatch;
        },
        set dispatch(nextDispatch) {
            dispatch = nextDispatch;
        },
        get name() {
            return name;
        },
        get state() {
            return state;
        },
        set state(nextState) {
            setState(nextState);
        },
        observe: function (observer) {
            observers.push(observer);
            return function () {
                observers = observers.filter(function (currentObserver) { return currentObserver !== observer; });
            };
        },
        on: function (type, actionHandler) {
            var types = Array.isArray(type) ? type : [type];
            types.forEach(function (currentType) {
                actionHandlers[currentType] = actionHandler;
            });
            // TODO: should be required if A has other keys than 'type'
            // https://stackoverflow.com/questions/52318011/optional-parameters-based-on-conditional-types
            return function (action) {
                var extraArgs = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    extraArgs[_i - 1] = arguments[_i];
                }
                return function () {
                    return dispatch.apply(void 0, __spread([__assign({ type: types[0] }, action)], extraArgs));
                };
            };
        },
    };
};
//# sourceMappingURL=store.js.map