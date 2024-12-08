import { Level } from '../Enums/Level';
import { Plugin } from './Plugin';

export class Error {
  id!: number;
  pattern?: string;
  solution?: string;
  description?: string;
  stringMatch: boolean = false;
  level: Level = Level.XTRA;
  pluginList: Plugin[] = [];

  clone(): Error {
    return Object.assign(new Error(), JSON.parse(JSON.stringify(this)));
  }
}
