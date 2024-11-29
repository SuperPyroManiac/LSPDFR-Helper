import { Subcommand } from '@sapphire/plugin-subcommands';
import type { Args } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class PluginsCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: 'plugins',
      subcommands: [
        {
          name: 'export',
          messageRun: 'pluginsExport',
        },
        {
          name: 'import',
          messageRun: 'pluginsImport',
        },
      ],
    });
  }

  public async pluginsExport(message: Message, args: Args) {
    return message.reply('Exporting plugins... -test passed');
  }

  public async pluginsImport(message: Message, args: Args) {
    return message.reply('Importing plugins... -test passed');
  }
}
