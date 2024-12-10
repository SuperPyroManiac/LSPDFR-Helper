import { ChatInputCommandDeniedPayload, Events, Listener, UserError } from '@sapphire/framework';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.ChatInputCommandDenied,
    });
  }

  public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    let replyMsg = {
      embeds: [
        EmbedCreator.Error(
          `__Banned!__\r\n-# You are banned from using this bot!\r\n>>> It has been determined that you abused the features of this bot and your access revoked! You may dispute this by vising our Discord.`
        ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder().setURL('https://dsc.pyrosfun.com/').setLabel('Pyros Discord').setStyle(ButtonStyle.Link),
        ]),
      ],
      ephemeral: true,
    };
    if (error.message != 'banned')
      replyMsg = { embeds: [EmbedCreator.Error(`__No Permission!__\r\n>>> You do not have permission to use this command!`)], components: [], ephemeral: true };

    if (interaction.deferred || interaction.replied) return interaction.editReply(replyMsg);
    return interaction.reply(replyMsg);
  }
}
