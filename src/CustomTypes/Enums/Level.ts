export enum Level {
  /** Processes messages */
  PMSG = 'PMSG',

  /** Special: Checks images text in AH channels via fuzzymatch */
  PIMG = 'PIMG',

  /** Checks via regex - Only TS can view */
  XTRA = 'XTRA',

  /** Checks via regex - Does not cause a crash */
  WARN = 'WARN',

  /** Checks via regex - Can cause a crash */
  SEVERE = 'SEVERE',

  /** Checks via regex - High priority, other errors will not show when this is present */
  CRITICAL = 'CRITICAL',
}
