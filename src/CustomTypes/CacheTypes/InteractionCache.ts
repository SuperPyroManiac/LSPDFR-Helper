import { addMinutes } from 'date-fns';
import { ButtonInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Command } from '@sapphire/framework';

export class InteractionCache {
  public Expire = addMinutes(new Date(), 5);
  public DiscordMessage!: Message;
  public Interaction: ContextMenuCommandInteraction | ButtonInteraction | Command.ChatInputCommandInteraction;

  public constructor(originalMessage: Message, interaction: ContextMenuCommandInteraction | ButtonInteraction | Command.ChatInputCommandInteraction) {
    this.Interaction = interaction;
    this.DiscordMessage = originalMessage;
  }

  public async Cleanup() {
    await this.Interaction.deleteReply().catch(() => {});
  }
}
