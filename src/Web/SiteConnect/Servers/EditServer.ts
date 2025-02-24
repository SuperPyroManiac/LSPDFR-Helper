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
        if (oldServer.redirect !== serverData.redirect) {
          changes.push(`**Redirect:** ${oldServer.redirect} → ${serverData.redirect}`);
        }
        if (oldServer.request !== serverData.request) {
          changes.push(`**Request:** ${oldServer.request} → ${serverData.request}`);
        }
        if (oldServer.ahType !== serverData.AhType) {
          changes.push(`**AH Type:** ${oldServer.ahType} → ${serverData.AhType}`);
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

        oldServer.enabled = serverData.enabled;
        oldServer.banned = serverData.banned;
        oldServer.redirect = serverData.redirect;
        oldServer.request = serverData.request;
        oldServer.ahType = serverData.AhType;
        oldServer.ahChId = serverData.ahChId;
        oldServer.ahMonChId = serverData.ahMonChId;
        oldServer.announceChId = serverData.announceChId;

        await DBManager.editServer(oldServer);
        await Logger.BotLog(
          EmbedCreator.Info(
            '__Server Edited!__\n' +
              `>>> -# Sender: ${userData.name}\n` +
              `**Server ID:** ${oldServer.id}\n**Server Name:** ${oldServer.name}\n${changes.join('\n')}`
          )
        );

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
