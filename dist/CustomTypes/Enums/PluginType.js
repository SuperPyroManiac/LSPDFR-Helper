"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginType = void 0;
var PluginType;
(function (PluginType) {
    /** LSPDFR plugins */
    PluginType[PluginType["LSPDFR"] = 1] = "LSPDFR";
    /** RagePluginHook plugins */
    PluginType[PluginType["RPH"] = 2] = "RPH";
    /** ASI scripts */
    PluginType[PluginType["ASI"] = 3] = "ASI";
    /** ScriptHookV scripts */
    PluginType[PluginType["SHV"] = 4] = "SHV";
    /** ScriptHookVDotNet scripts */
    PluginType[PluginType["SHVDN"] = 5] = "SHVDN";
    /** Libraries, ex: RageNativeUI or PyroCommon */
    PluginType[PluginType["LIBRARY"] = 6] = "LIBRARY";
})(PluginType || (exports.PluginType = PluginType = {}));
