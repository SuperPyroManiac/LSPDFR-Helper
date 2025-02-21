import { DBManager } from '../../../Functions/DBManager';
import { Logger } from '../../../Functions/Messages/Logger';
import { APIManager } from '../../APIManager';
import { Request, Response } from 'express';
import { EmbedCreator } from '../../../Functions/Messages/EmbedCreator';

export class EditServer {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/EditServer', async (req: Request, res: Response) => {
      const authToken = req.headers['x-site-auth'];

      if (authToken !== process.env['WEBSITE_KEY']) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { serverData, userData } = req.body;

      if (!serverData) {
        res.status(400).json({ error: 'Missing server data' });
        return;
      }

      try {
        const oldServer = await DBManager.getServer(serverData.id);
        if (!oldServer) {
          res.status(404).json({ error: 'Server not found' });
          return;
        }

        const changes: string[] = [];

        if (oldServer.enabled !== serverData.enabled) {
          changes.push(`**Enabled:** ${oldServer.enabled} → ${serverData.enabled}`);
        }
        if (oldServer.banned !== serverData.banned) {
          changes.push(`**Banned:** ${oldServer.banned} → ${serverData.banned}`);
        }
        if (oldServer.autoSupport !== serverData.autoSupport) {
          changes.push(`**Auto Support:** ${oldServer.autoSupport} → ${serverData.autoSupport}`);
        }
        if (oldServer.ahCases !== serverData.ahCases) {
          changes.push(`**Cases Enabled:** ${oldServer.ahCases} → ${serverData.ahCases}`);
        }
        if (oldServer.ahChId !== serverData.ahChId) {
          changes.push(`**Helper Channel:** ${oldServer.ahChId} → ${serverData.ahChId}`);
        }
        if (oldServer.ahMonChId !== serverData.ahMonChId) {
          changes.push(`**Monitor Channel:** ${oldServer.ahMonChId} → ${serverData.ahMonChId}`);
        }
        if (oldServer.announceChId !== serverData.announceChId) {
          changes.push(`**Announce Channel:** ${oldServer.announceChId} → ${serverData.announceChId}`);
        }
        if (oldServer.updateChId !== serverData.updateChId) {
          changes.push(`**Update Channel:** ${oldServer.updateChId} → ${serverData.updateChId}`);
        }

        oldServer.enabled = serverData.enabled;
        oldServer.banned = serverData.banned;
        oldServer.autoSupport = serverData.autoSupport;
        oldServer.ahCases = serverData.ahCases;
        oldServer.ahChId = serverData.ahChId;
        oldServer.ahMonChId = serverData.ahMonChId;
        oldServer.announceChId = serverData.announceChId;
        oldServer.updateChId = serverData.updateChId;

        await DBManager.editServer(oldServer);
        await Logger.BotLog(EmbedCreator.Info('__Server Edited!__\n' + `>>> -# Sender: ${userData.name}\n` + `**Server:** ${oldServer.id}\n${changes.join('\n')}`));

        res.status(200).json({
          success: true,
          message: `Server ${oldServer.id} processed successfully`,
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
