import { ShardingManager } from 'discord.js';
import { Cache } from '../../Cache';
import { AhChannel } from '../../Functions/AutoHelper/AhChannel';
import { CaseMonitor } from '../../Functions/AutoHelper/CaseMonitor';
import { APIManager } from '../APIManager';
import { Request, Response } from 'express';

export class UpdateServer {
  public static init(manager: ShardingManager) {
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

        await manager.broadcastEval(
          async (client, { guildId }) => {
            if (client.guilds.cache.has(guildId)) {
              await AhChannel.UpdateCaseMsg(guildId);
              await CaseMonitor.Update(guildId);
            }
          },
          { context: { guildId } }
        );

        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
