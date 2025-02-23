import { container } from '@sapphire/framework';
import { Cache } from '../../Cache';
import { UpdateWebhook } from '../../CustomTypes/MainTypes/UpdateWebhook';
import { AhChannel } from '../../Functions/AutoHelper/AhChannel';
import { CaseMonitor } from '../../Functions/AutoHelper/CaseMonitor';
import { DBManager } from '../../Functions/DBManager';
import { APIManager } from '../APIManager';
import { Request, Response } from 'express';
import { NewsChannel, TextChannel } from 'discord.js';
import { EmbedCreator } from '../../Functions/Messages/EmbedCreator';

export class UpdateServer {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/UpdateServer', async (req: Request, res: Response) => {
      const authToken = req.headers['x-site-auth'];

      if (authToken !== process.env['WEBSITE_KEY']) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { guildId } = req.body;

      if (!guildId) {
        res.status(400).json({ error: 'Missing guild ID' });
        return;
      }

      try {
        await Cache.resetCache();
        await AhChannel.UpdateTicketMsg(guildId);
        await AhChannel.UpdateChannelMsg(guildId);
        await CaseMonitor.Update(guildId);

        //Announce Channel Setup
        const serv = Cache.getServer(guildId);
        const existingHook = await DBManager.getWebhook(guildId);
        if (existingHook)
          if (existingHook.channelId !== serv?.announceChId) {
            await existingHook?.delete();
            if (existingHook.channelId === serv?.announceChId) {
              res.status(200).json({ success: true });
              return;
            }
          }
        if (serv?.announceChId != '0') {
          const ch = await container.client.channels.fetch(serv?.announceChId!);
          if (ch instanceof TextChannel || ch instanceof NewsChannel) {
            const webhook = await ch.createWebhook({
              name: 'LSPDFR Helper',
              avatar: container.client.user?.avatarURL(),
              reason: 'Plugin update notifications',
            });
            const newHook = new UpdateWebhook(guildId, serv?.announceChId!, webhook.url);
            await DBManager.createWebhook(newHook);
            await newHook.send({ embeds: [EmbedCreator.Success('__Updates Channel Set__\nPlugin updates will now be posted here!')] });
          }
        }

        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
