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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStore = void 0;
var react_1 = require("react");
var Provider_1 = require("./Provider");
exports.useStore = function (store) {
    var registerStore = react_1.useContext(Provider_1.Context).registerStore;
    registerStore(store);
    var _a = __read(react_1.useState(store.state), 2), state = _a[0], setState = _a[1];
    react_1.useEffect(function () { return store.observe(setState); }, [store]);
    return state;
};
//# sourceMappingURL=useStore.js.map