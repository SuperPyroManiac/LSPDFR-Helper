export enum Level {
  /** Processes messages */
  PMSG = 1,

  /** Special: Checks images text in AH channels via fuzzymatch */
  PIMG = 2,

  /** Checks via regex - Only TS can view */
  XTRA = 3,

  /** Checks via regex - Does not cause a crash */
  WARN = 4,

  /** Checks via regex - Can cause a crash */
  SEVERE = 5,

  /** Checks via regex - High priority, other errors will not show when this is present */
  CRITICAL = 6,
}
