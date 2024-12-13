import { hyperlink } from 'discord.js';
import { PluginType } from '../Enums/PluginType';
import { State } from '../Enums/State';

export class Plugin {
  public name!: string;
  public dname: string = this.name;
  public description?: string;
  public version?: string;
  public eaVersion?: string;
  public id?: number;
  public link?: string;
  public type: PluginType = PluginType.LIBRARY;
  public state: State = State.IGNORE;

  public constructor(name: string = '') {
    this.name = name;
    this.dname = name;
  }

  public linkedName(): string {
    if (!this.link) return hyperlink(this.dname, `https://www.google.com/search?q=lspdfr+${this.dname.replace(' ', '+')}`);
    return hyperlink(this.dname, this.link);
  }

  public clone(): Plugin {
    return Object.assign(new Plugin(), JSON.parse(JSON.stringify(this)));
  }
}
