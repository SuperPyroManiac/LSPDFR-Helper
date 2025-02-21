import { codeBlock } from 'discord.js';
import { DBManager } from '../../../Functions/DBManager';
import { Logger } from '../../../Functions/Messages/Logger';
import { APIManager } from '../../APIManager';
import { Request, Response } from 'express';
import { EmbedCreator } from '../../../Functions/Messages/EmbedCreator';

export class RemovePlugin {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/RemovePlugin', async (req: Request, res: Response) => {
      const authToken = req.headers['x-site-auth'];

      if (authToken !== process.env['WEBSITE_KEY']) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { pluginData, userData } = req.body;

      if (!pluginData) {
        res.status(400).json({ error: 'Missing plugin data' });
        return;
      }

      try {
        const oldPlugin = await DBManager.getPlugin(pluginData.name);
        if (!oldPlugin) {
          res.status(404).json({ error: 'Plugin not found' });
          return;
        }

        await DBManager.deletePlugin(oldPlugin.name);
        await Logger.BotLog(
          EmbedCreator.Warning(
            '__Removed Plugin!__\n ' +
              `>>> -# Sender: ${userData.name}\n` +
              `**Plugin:** ${oldPlugin.name}\n` +
              `**Display Name:** ${oldPlugin.dname}\n` +
              `**link:** ${oldPlugin.link}\n` +
              `**ID:** ${oldPlugin.id}\n` +
              `**Version:** ${oldPlugin.version}\n` +
              `**EA Version:** ${oldPlugin.eaVersion}\n` +
              `**Description:** ${codeBlock(oldPlugin.description!)}\n` +
              `**Type:** ${oldPlugin.type}\n` +
              `**State:** ${oldPlugin.state}\n`
          )
        );

        res.status(200).json({
          success: true,
          message: `Plugin ${oldPlugin.name} processed successfully`,
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
