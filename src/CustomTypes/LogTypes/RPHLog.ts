import { Log } from './Log';
import { Error } from '../MainTypes/Error';
import { Plugin } from '../MainTypes/Plugin';

export class RPHLog extends Log {
  public logPath?: string;
  public logModified?: boolean;
  public errors: Error[] = [];
  public current: Plugin[] = [];
  public outdated: Plugin[] = [];
  public missing: Plugin[] = [];
  public newVersion: Plugin[] = [];
  public gtaVersion?: string;
  public rphVersion?: string;
  public lspdfrVersion?: string;
}
