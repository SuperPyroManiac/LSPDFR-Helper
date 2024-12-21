import { Events, Listener } from '@sapphire/framework';
import { Guild } from 'discord.js';
import { ServerValidation } from '../Functions/Validations/Servers';

export class GuildJoinListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.GuildCreate,
    });
  }

  public async run(_guild: Guild) {
    if (this.container.client.shard?.ids[0] !== 0) return;
    await ServerValidation.AddMissing();
  }
}
