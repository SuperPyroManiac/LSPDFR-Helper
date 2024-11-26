export enum State {
  /** Normal and working */
  NORMAL = 1,

  /** Normal but not downloaded from LCPDFR.com */
  EXTERNAL = 2,

  /** Does not work, should be removed */
  BROKEN = 3,

  /** SPECIAL: Requires Pyro's approval! */
  IGNORE = 4,
}
