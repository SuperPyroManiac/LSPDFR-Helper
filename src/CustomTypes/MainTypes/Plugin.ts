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
  type!: PluginType;
  state!: State;

  linkedName(): string {
    if (!this.link) {
      return `[${this.dname}](https://www.google.com/search?q=lspdfr+${this.dname.replace(' ', '+')})`;
    }
    return `[${this.dname}](${this.link})`;
  }

  clone(): Plugin {
    return JSON.parse(JSON.stringify(this));
  }
}
