import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { DBManager } from '../Functions/DBManager';
import { Plugin } from '../CustomTypes/MainTypes/Plugin';
import { PluginType } from '../CustomTypes/Enums/PluginType';
import { State } from '../CustomTypes/Enums/State';

export class TestCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('test')
        .setDescription('My personal test thingy')
        .addStringOption((option) =>
          option //
            .setName('plugin')
            .setDescription('Returns a plugin')
            .setRequired(true)
        )
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const plugName = interaction.options.getString('plugin', true);
    const plug = await DBManager.getPlugin(plugName);

    if (!plug) {
      await interaction.reply({ content: 'Plugin not found - creating', ephemeral: true });
      await DBManager.createPlugin(
        Object.assign(new Plugin(), {
          name: plugName,
          dname: plugName,
          description: 'This is a test plugin',
          version: '1.0.0',
          eaVersion: '1.0.0',
          id: 1,
          link: 'https://www.google.com',
          type: PluginType.LSPDFR,
          state: State.NORMAL,
        })
      );
      return;
    }

    return await interaction.reply({
      content: `Plugin: ${plug.name}\r\nDescription: ${plug.description}\r\nVersion: ${plug.version}\r\n`,
      ephemeral: true,
      fetchReply: true,
    });
  }
}
