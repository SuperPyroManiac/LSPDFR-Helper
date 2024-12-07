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
        .setDescription('Manage plugins for your database')
        .addSubcommand((command) => command.setName('add').setDescription('Add a plugin to the database'))
        .addSubcommand((command) => command.setName('edit').setDescription('Edit a plugin in the database'))
        .addSubcommand((command) => command.setName('remove').setDescription('Remove a plugin from the database'))
        .addSubcommand((command) => command.setName('export').setDescription('Export all plugins to a JSON file'))
    );
  }

  public async pluginsAdd(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.reply({
      content: 'The add plugin functionality is under development!',
      ephemeral: true,
    });
  }

  public async pluginsEdit(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.reply({
      content: 'The edit plugin functionality is under development!',
      ephemeral: true,
    });
  }

  public async pluginsRemove(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.reply({
      content: 'The remove plugin functionality is under development!',
      ephemeral: true,
    });
  }

  public async pluginsExport(interaction: Subcommand.ChatInputCommandInteraction) {
    const plugins = Cache.getPlugins();
    const pluginCount = plugins.length;


    Logger.BotLog(
      EmbedCreator.Warning(
        `__Exported ${pluginCount} Plugins!__\r\nRequested by ${interaction.user.tag} in <#${interaction.channelId}>`
      )
    );

    // Reply with the file
    await interaction.reply({
      embeds: [
        EmbedCreator.Success(
          `__Exported ${pluginCount} Plugins!__\r\nMake sure this file does not get leaked!`
        ),
      ],
      files: [
        {
          attachment: Buffer.from(JSON.stringify(plugins, null, 2), 'utf-8'),
          name: 'plugins.json',
        },
      ],
      ephemeral: true,
    });
  }
}
