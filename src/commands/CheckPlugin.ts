import { Command } from '@sapphire/framework';
import { ApplicationIntegrationType, codeBlock } from 'discord.js';
import { Cache } from '../Cache';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';

export class CheckPluginCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setName('checkplugin')
        .setDescription('Check information on a plugin.')
        .addStringOption((option) => option.setName('name').setDescription('Name of the plugin to check').setRequired(true).setAutocomplete(true))
    );
  }

  public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const plugins = await Cache.getPlugins();
    const choices = plugins
      .filter((plugin) => plugin.name.toLowerCase().includes(focusedValue.toLowerCase()))
      .slice(0, 25)
      .map((plugin) => ({ name: plugin.name, value: plugin.name }));
    await interaction.respond(choices);
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const pluginName = interaction.options.getString('name') ?? 'NUFFIN';
    const plug = await Cache.getPlugin(pluginName);

    if (!plug) {
      await interaction.reply({
        embeds: [EmbedCreator.Alert('__No Plugin Found!__\r\n>>> The name you entered was not found in our database!')],
        ephemeral: true,
      });
      return;
    }

    const emb = EmbedCreator.Question(
      `__${plug.linkedName()}__\r\n>>> ` +
        `**Display Name:** ${plug.dname}\r\n` +
        `**Version:** ${plug.version}\r\n` +
        `**Type:** ${plug.type}\r\n` +
        `**State:** ${plug.state}\r\n` +
        `**Notes:** \r\n${codeBlock(plug.description ?? 'N/A')}\r\n`
    );
    await interaction.reply({ embeds: [emb], ephemeral: true });
  }
}
