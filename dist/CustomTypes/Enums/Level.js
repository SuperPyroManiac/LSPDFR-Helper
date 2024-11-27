"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level = void 0;
var Level;
(function (Level) {
    /** Processes messages */
    Level[Level["PMSG"] = 1] = "PMSG";
    /** Special: Checks images text in AH channels via fuzzymatch */
    Level[Level["PIMG"] = 2] = "PIMG";
    /** Checks via regex - Only TS can view */
    Level[Level["XTRA"] = 3] = "XTRA";
    /** Checks via regex - Does not cause a crash */
    Level[Level["WARN"] = 4] = "WARN";
    /** Checks via regex - Can cause a crash */
    Level[Level["SEVERE"] = 5] = "SEVERE";
    /** Checks via regex - High priority, other errors will not show when this is present */
    Level[Level["CRITICAL"] = 6] = "CRITICAL";
})(Level || (exports.Level = Level = {}));
