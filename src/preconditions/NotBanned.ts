import { AllFlowsPrecondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Cache } from '../Cache';

export class NotBannedPrecondition extends AllFlowsPrecondition {
  public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
    super(context, {
      ...options,
      position: 20,
    });
  }

  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.checkBanned(interaction.user.id);
  }

  public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkBanned(interaction.user.id);
  }

  public override async messageRun(message: Message) {
    return this.checkBanned(message.author.id);
  }

  private async checkBanned(userId: string) {
    const usr = Cache.getUser(userId);
    if (!usr) return this.ok();
    return usr.banned === false ? this.ok() : this.error({ message: 'banned' });
  }
}
