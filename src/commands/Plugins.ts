import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Cache } from '../Cache';
import { Logger } from '../Functions/Messages/Logger';

export class PluginsCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: 'plugins',
      subcommands: [
        {
          name: 'add',
          chatInputRun: 'pluginsAdd',
        },
        {
          name: 'edit',
          chatInputRun: 'pluginsEdit',
        },
        {
          name: 'remove',
          chatInputRun: 'pluginsRemove',
        },
        {
          name: 'export',
          chatInputRun: 'pluginsExport',
        },
      ],
    });
  }

  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('plugins')
        .setDescription('Plugin commands')
        .addSubcommand((command) => command.setName('add').setDescription('Adds a plugin to the database!'))
        .addSubcommand((command) => command.setName('edit').setDescription('Edits a plugin in the database!'))
        .addSubcommand((command) => command.setName('remove').setDescription('Removes a plugin from the database!'))
        .addSubcommand((command) => command.setName('export').setDescription('Exports all plugins to a json file!'))
    );
  }

  public async pluginsAdd(interaction: Subcommand.ChatInputCommandInteraction) {}
  public async pluginsEdit(interaction: Subcommand.ChatInputCommandInteraction) {}
  public async pluginsRemove(interaction: Subcommand.ChatInputCommandInteraction) {}

  public async pluginsExport(interaction: Subcommand.ChatInputCommandInteraction) {
    Logger.BotLog(
      EmbedCreator.Warning(`__Exported ${Cache.getPlugins().length} Plugins!__\r\n> Requested by ${interaction.user.tag} in <#${interaction.channelId}>`)
    );
    return await interaction.reply({
      embeds: [EmbedCreator.Success(`__Exported ${Cache.getPlugins().length} Plugins!__\r\n-# Ensure these do not get leaked!`)],
      files: [
        {
          attachment: Buffer.from(JSON.stringify(Cache.getPlugins(), null, 2), 'utf-8'),
          name: 'plugins.json',
        },
      ],
      ephemeral: true,
    });
  }
}
