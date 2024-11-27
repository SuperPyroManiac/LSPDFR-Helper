"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
class Plugin {
    name;
    dname = this.name;
    description;
    version;
    eaVersion;
    id;
    link;
    type;
    state;
    linkedName() {
        if (!this.link) {
            return `[${this.dname}](https://www.google.com/search?q=lspdfr+${this.dname.replace(' ', '+')})`;
        }
        return `[${this.dname}](${this.link})`;
    }
    clone() {
        return JSON.parse(JSON.stringify(this));
    }
}
exports.Plugin = Plugin;
