import { Level } from '../Enums/Level';
import { Plugin } from './Plugin';

export class Error {
  id!: number;
  pattern?: string;
  solution?: string;
  description?: string;
  stringMatch: boolean = false;
  level!: Level;
  pluginList: Plugin[] = [];

  clone(): Error {
    return JSON.parse(JSON.stringify(this));
  }
}
