import { AllFlowsPrecondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { Cache } from '../Cache';

export class BotEditorPrecondition extends AllFlowsPrecondition {
  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.checkEditor(interaction.user.id);
  }

  public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkEditor(interaction.user.id);
  }

  public override async messageRun(message: Message) {
    return this.checkEditor(message.author.id);
  }

  private async checkEditor(userId: string) {
    const usr = Cache.getUser(userId);
    if (!usr) return this.ok();
    return usr.botEditor === true ? this.ok() : this.error({ message: '__No Permission__\r\n>>> You do not have permission to use this command!' });
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    BotEditor: never;
  }
}

export default undefined;
