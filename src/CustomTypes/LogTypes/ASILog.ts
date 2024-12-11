import { Plugin } from '../MainTypes/Plugin';
import { Log } from './Log';

export class ASILog extends Log {
  loadedAsiFiles: Plugin[] = [];
  brokenAsiFiles: string[] = [];
  failedAsiFiles: Plugin[] = [];
  missing: Plugin[] = [];
}
