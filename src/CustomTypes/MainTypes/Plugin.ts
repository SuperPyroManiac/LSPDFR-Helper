import { hyperlink } from 'discord.js';
import { PluginType } from '../Enums/PluginType';
import { State } from '../Enums/State';

export class Plugin {
  name!: string;
  dname: string = this.name;
  description?: string;
  version?: string;
  eaVersion?: string;
  id?: number;
  link?: string;
  type: PluginType = PluginType.LIBRARY;
  state: State = State.IGNORE;

  constructor(name: string = '') {
    this.name = name;
    this.dname = name;
  }

  linkedName(): string {
    if (!this.link) return hyperlink(this.dname, `https://www.google.com/search?q=lspdfr+${this.dname.replace(' ', '+')}`);
    return hyperlink(this.dname, this.link);
  }

  clone(): Plugin {
    return Object.assign(new Plugin(), JSON.parse(JSON.stringify(this)));
  }
}
