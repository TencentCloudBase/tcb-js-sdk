"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var Web = __importStar(require("./platforms/web"));
var WX_MP = __importStar(require("./platforms/wx_mp"));
exports.adapter = (_a = (function () {
    if (WX_MP.isWxMp()) {
        return {
            adapter: WX_MP.genAdapter(),
            runtime: types_1.RUNTIME.WX_MP
        };
    }
    return {
        adapter: Web.genAdapter(),
        runtime: types_1.RUNTIME.WEB
    };
})(), _a.adapter), exports.runtime = _a.runtime;
