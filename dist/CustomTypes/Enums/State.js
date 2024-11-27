"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
var State;
(function (State) {
    /** Normal and working */
    State[State["NORMAL"] = 1] = "NORMAL";
    /** Normal but not downloaded from LCPDFR.com */
    State[State["EXTERNAL"] = 2] = "EXTERNAL";
    /** Does not work, should be removed */
    State[State["BROKEN"] = 3] = "BROKEN";
    /** SPECIAL: Requires Pyro's approval! */
    State[State["IGNORE"] = 4] = "IGNORE";
})(State || (exports.State = State = {}));
