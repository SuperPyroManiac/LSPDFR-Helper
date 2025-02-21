import { container } from '@sapphire/framework';
import { TextChannel, WebhookClient, WebhookMessageCreateOptions } from 'discord.js';
import { DBManager } from '../../Functions/DBManager';
import { Cache } from '../../Cache';

export class UpdateWebhook {
  public readonly serverId: string;
  public readonly channelId: string;
  public readonly webhookUrl: string;

  public constructor(serverId: string, channelId: string, webhookUrl: string) {
    this.serverId = serverId;
    this.channelId = channelId;
    this.webhookUrl = webhookUrl;
  }

  public getChannel(): TextChannel | undefined {
    const channel = container.client.channels.cache.get(this.channelId);
    return channel instanceof TextChannel ? channel : undefined;
  }

  public async send(payload: WebhookMessageCreateOptions): Promise<boolean> {
    const webhook = new WebhookClient({ url: this.webhookUrl });
    try {
      await webhook.send(payload);
      return true;
    } catch {
      await this.delete();
      return false;
    }
  }

  public async delete(): Promise<boolean> {
    const webhook = new WebhookClient({ url: this.webhookUrl });
    try {
      const serv = Cache.getServer(this.serverId);
      serv!.announceChId = '0';
      await webhook.delete();
      await DBManager.deleteWebhook(this.serverId);
      await DBManager.editServer(serv!);
      return true;
    } catch {
      const serv = Cache.getServer(this.serverId);
      serv!.announceChId = '0';
      await DBManager.deleteWebhook(this.serverId);
      await DBManager.editServer(serv!);
      return false;
    }
  }
}
