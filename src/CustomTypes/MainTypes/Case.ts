import { container } from '@sapphire/framework';
import { addDays } from 'date-fns';
import { ThreadChannel } from 'discord.js';

export class Case {
  public id: string;
  public ownerId?: string;
  public channelId?: string;
  public serverId!: string;
  public open: boolean = true;
  public createDate: Date = new Date();
  public expireDate: Date = addDays(new Date(), 1);

  public constructor(id: string = '') {
    this.id = id;
  }

  public clone(): Case {
    return Object.assign(new Case(), JSON.parse(JSON.stringify(this)));
  }

  public isExpired(): boolean {
    return this.expireDate < new Date();
  }

  public getAhChannel(): ThreadChannel | undefined {
    return this.channelId ? (container.client.channels.cache.get(this.channelId) as ThreadChannel) : undefined;
  }
}
