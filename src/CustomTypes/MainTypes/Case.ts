import { container } from '@sapphire/framework';
import { addDays } from 'date-fns';
import { ThreadChannel } from 'discord.js';

export class Case {
  id: string;
  ownerId?: string;
  channelId?: string;
  serverId!: string;
  open: boolean = true;
  createDate: Date = new Date();
  expireDate: Date = addDays(new Date(), 1);

  constructor(id: string = '') {
    this.id = id;
  }

  clone(): Case {
    return Object.assign(new Case(), JSON.parse(JSON.stringify(this)));
  }

  isExpired(): boolean {
    return this.expireDate < new Date();
  }

  getAhChannel(): ThreadChannel | undefined {
    return this.channelId ? (container.client.channels.cache.get(this.channelId) as ThreadChannel) : undefined;
  }
}
