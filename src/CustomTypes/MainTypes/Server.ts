import { container } from '@sapphire/framework';
import { Guild } from 'discord.js';
import { AhType } from '../Enums/AhType';

export class Server {
  public id: string;
  public name?: string;
  public ownerId?: string;
  public enabled: boolean = true;
  public banned: boolean = false;
  public redirect: boolean = false;
  public request: boolean = true;
  public ahType: AhType = AhType.TICKET;
  public ahChId?: string;
  public ahMonChId?: string;
  public announceChId?: string;

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
