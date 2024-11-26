import { Log } from './Log';
import { Error } from '../MainTypes/Error';
import { Plugin } from '../MainTypes/Plugin';

export class RPHLog extends Log {
  logPath?: string;
  logModified?: boolean;
  errors: Error[] = [];
  current: Plugin[] = [];
  outdated: Plugin[] = [];
  missing: Plugin[] = [];
  newVersion: Plugin[] = [];
  gtaVersion?: string;
  rphVersion?: string;
  lspdfrVersion?: string;
}
