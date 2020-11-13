"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDispatch = void 0;
var react_1 = require("react");
var Provider_1 = require("./Provider");
exports.useDispatch = function () { return react_1.useContext(Provider_1.Context).dispatch; };
//# sourceMappingURL=useDispatch.js.map