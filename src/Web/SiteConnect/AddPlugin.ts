import { codeBlock } from 'discord.js';
import { Plugin } from '../../CustomTypes/MainTypes/Plugin';
import { DBManager } from '../../Functions/DBManager';
import { Logger } from '../../Functions/Messages/Logger';
import { APIManager } from '../APIManager';
import { Request, Response } from 'express';
import { EmbedCreator } from '../../Functions/Messages/EmbedCreator';

export class AddPlugin {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/AddPlugin', async (req: Request, res: Response) => {
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
        const newPlugin = new Plugin(pluginData.name);
        newPlugin.dname = pluginData.dname || pluginData.name;
        newPlugin.description = pluginData.description;
        newPlugin.version = pluginData.version;
        newPlugin.eaVersion = pluginData.eaVersion;
        newPlugin.link = pluginData.link;
        newPlugin.id = pluginData.id;
        newPlugin.type = pluginData.type;
        newPlugin.state = pluginData.state;

        await DBManager.createPlugin(newPlugin);
        await Logger.BotLog(
          EmbedCreator.Info(
            '__Added new plugin!__\n ' +
              `>>> -# Sender: ${userData.name}\n` +
              `**Plugin:** ${newPlugin.name}\n` +
              `**Display Name:** ${newPlugin.dname}\n` +
              `**link:** ${newPlugin.link}\n` +
              `**ID:** ${newPlugin.id}\n` +
              `**Version:** ${newPlugin.version}\n` +
              `**EA Version:** ${newPlugin.eaVersion}\n` +
              `**Description:** ${codeBlock(newPlugin.description!)}\n` +
              `**Type:** ${newPlugin.type}\n` +
              `**State:** ${newPlugin.state}\n`
          )
        );

        res.status(200).json({
          success: true,
          message: `Plugin ${newPlugin.name} processed successfully`,
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
