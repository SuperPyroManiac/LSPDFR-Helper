"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error = void 0;
class Error {
    id;
    pattern;
    solution;
    description;
    stringMatch;
    level;
    pluginList = [];
    clone() {
        return JSON.parse(JSON.stringify(this));
    }
}
exports.Error = Error;
