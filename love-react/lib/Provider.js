"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = exports.Context = void 0;
var react_1 = require("react");
exports.Context = react_1.createContext({});
exports.Provider = function (_a) {
    var children = _a.children, of = _a.of;
    return react_1.default.createElement(exports.Context.Provider, { value: of }, children);
};
//# sourceMappingURL=Provider.js.map