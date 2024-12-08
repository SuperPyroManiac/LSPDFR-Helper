import { Events, Listener } from '@sapphire/framework';
import { Client, Guild } from 'discord.js';

export class GuildLeaveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.GuildDelete,
    });
  }

  public run(guild: Guild) {
    console.log(`Left guild ${guild.name}!`);
  }
}
