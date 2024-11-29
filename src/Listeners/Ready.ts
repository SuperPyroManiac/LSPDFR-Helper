import { Listener } from '@sapphire/framework';
import { Client } from 'discord.js';
import { Startup } from '../Functions/Startup';

export class Ready extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: 'ready',
    });
  }
  public async run(client: Client) {
    await Startup.Init();
  }
}
