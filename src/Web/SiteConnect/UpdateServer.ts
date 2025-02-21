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
        const serv = Cache.getServer(guildId);
        await Cache.resetCache();
        await AhChannel.UpdateCaseMsg(guildId);
        await CaseMonitor.Update(guildId);

        //Announce Channel Setup
        const existingHook = await DBManager.getWebhook(guildId);
        console.log('1');
        if (existingHook) if (existingHook.channelId !== serv?.announceChId) await existingHook?.delete();
        console.log('2');
        if (serv?.announceChId != '0') {
          console.log('3');
          const ch = await container.client.channels.fetch(serv?.announceChId!);
          console.log('4');
          if (ch instanceof TextChannel || ch instanceof NewsChannel) {
            console.log('5');
            const webhook = await ch.createWebhook({
              name: 'LSPDFR Helper',
              avatar: 'https://i.imgur.com/jxODw4N.png',
            });
            const newHook = new UpdateWebhook(guildId, serv?.announceChId!, webhook.url);
            console.log('6');
            await DBManager.createWebhook(newHook);
            console.log('7');
            await newHook.send({ embeds: [EmbedCreator.Success('Updates Channel Set__\nPlugin updates will now be posted here!')] });
          }
        }

        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
