import { container } from '@sapphire/framework';
import { Guild } from 'discord.js';

export class Server {
  public id: string;
  public name?: string;
  public ownerId?: string;
  public enabled?: boolean = true;
  public banned?: boolean = false;
  public autoSupport?: boolean = true;
  public ahCases: boolean = true;
  public ahChId?: string;
  public ahMonChId?: string;
  public announceChId?: string;
  public updateChId?: string;

  public constructor(id: string = '') {
    this.id = id;
  }

  public clone(): Server {
    return Object.assign(new Server(), JSON.parse(JSON.stringify(this)));
  }

  public getGuild(): Guild | undefined {
    return container.client.guilds.cache.filter((x) => x.id === this.id).first();
  }
}
