"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPHLog = void 0;
const Log_1 = require("./Log");
class RPHLog extends Log_1.Log {
    logPath;
    logModified;
    errors = [];
    current = [];
    outdated = [];
    missing = [];
    newVersion = [];
    gtaVersion;
    rphVersion;
    lspdfrVersion;
}
exports.RPHLog = RPHLog;
