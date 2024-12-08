import { Events, Listener } from '@sapphire/framework';
import { Client, Guild } from 'discord.js';
import { ServerValidation } from '../Functions/Validations/Servers';
import { Cache } from '../Cache';
import { DBManager } from '../Functions/DBManager';
import { Server } from 'http';

export class GuildJoinListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.GuildCreate,
    });
  }

  public async run(guild: Guild) {
    ServerValidation.AddMissing();
  }
}
