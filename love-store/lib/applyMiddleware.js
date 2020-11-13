"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMiddleware = void 0;
var compose_1 = __importDefault(require("./compose"));
function applyMiddleware(middlewareAPI) {
    var middlewares = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middlewares[_i - 1] = arguments[_i];
    }
    var dispatch = function () {
        throw new Error("Dispatching while constructing your middleware is not allowed. " +
            "Other middleware would not be applied to this dispatch.");
    };
    var chain = middlewares.map(function (middleware) {
        return middleware({ getState: middlewareAPI.getState, dispatch: dispatch });
    });
    dispatch = compose_1.default.apply(void 0, __spread(chain))(middlewareAPI.dispatch);
    return dispatch;
}
exports.applyMiddleware = applyMiddleware;
//# sourceMappingURL=applyMiddleware.js.map