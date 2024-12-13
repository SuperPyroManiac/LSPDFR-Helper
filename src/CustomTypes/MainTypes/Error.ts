import { Level } from '../Enums/Level';
import { Plugin } from './Plugin';

export class Error {
  public id!: number;
  public pattern?: string;
  public solution?: string;
  public description?: string;
  public stringMatch: boolean = false;
  public level: Level = Level.XTRA;
  public pluginList: Plugin[] = [];

  public clone(): Error {
    return Object.assign(new Error(), JSON.parse(JSON.stringify(this)));
  }
}
