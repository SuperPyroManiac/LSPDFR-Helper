export enum State {
  /** Normal and working */
  NORMAL = 'NORMAL',

  /** Normal but not downloaded from LCPDFR.com */
  EXTERNAL = 'EXTERNAL',

  /** Does not work, should be removed */
  BROKEN = 'BROKEN',

  /** SPECIAL: Requires Pyro's approval! */
  IGNORE = 'IGNORE',
}
