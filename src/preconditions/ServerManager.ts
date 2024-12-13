import { AllFlowsPrecondition } from '@sapphire/framework';
import { PermissionsBitField, type ChatInputCommandInteraction, type ContextMenuCommandInteraction } from 'discord.js';

export class ServerManagerPrecondition extends AllFlowsPrecondition {
  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.checkServerManager(interaction);
  }

  public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkServerManager(interaction);
  }

  public override messageRun() {
    return this.ok();
  }

  private async checkServerManager(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
    const permissions = interaction.member?.permissions;
    if (permissions instanceof PermissionsBitField) {
      if (permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return this.ok();
      }
    }
    return this.error({ message: '__No Permission__\r\n>>> You do not have permission to use this command!' });
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    ServerManager: never;
  }
}

export default undefined;
