import { Events, Listener } from '@sapphire/framework';
import { Client, Guild } from 'discord.js';

export class GuildJoinListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.GuildCreate,
    });
  }

  public run(guild: Guild) {
    console.log(`Joined guild ${guild.name}!`);
  }
}
