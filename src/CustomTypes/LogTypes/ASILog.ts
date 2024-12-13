import { Plugin } from '../MainTypes/Plugin';
import { Log } from './Log';

export class ASILog extends Log {
  public loadedAsiFiles: Plugin[] = [];
  public brokenAsiFiles: string[] = [];
  public failedAsiFiles: Plugin[] = [];
  public missing: Plugin[] = [];
}
