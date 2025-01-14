import { codeBlock } from 'discord.js';
import { DBManager } from '../../Functions/DBManager';
import { Logger } from '../../Functions/Messages/Logger';
import { APIManager } from '../APIManager';
import { Request, Response } from 'express';
import { EmbedCreator } from '../../Functions/Messages/EmbedCreator';

export class EditPlugin {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/EditPlugin', async (req: Request, res: Response) => {
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

        const changes: string[] = [];

        if (oldPlugin.dname !== pluginData.dname) {
          changes.push(`**Display Name:** ${oldPlugin.dname} → ${pluginData.dname}`);
        }
        if (oldPlugin.description !== pluginData.description) {
          changes.push(`**Description:** ${codeBlock(oldPlugin.description!)} → ${codeBlock(pluginData.description!)}`);
        }
        if (oldPlugin.version !== (pluginData.version ?? null)) {
          changes.push(`**Version:** ${oldPlugin.version} → ${pluginData.version ?? null}`);
        }
        if (oldPlugin.eaVersion !== (pluginData.eaVersion ?? null)) {
          changes.push(`**EA Version:** ${oldPlugin.eaVersion} → ${pluginData.eaVersion ?? null}`);
        }
        if (oldPlugin.link !== (pluginData.link ?? null)) {
          changes.push(`**Link:** ${oldPlugin.link} → ${pluginData.link ?? null}`);
        }
        if (oldPlugin.id !== (pluginData.id ?? null)) {
          changes.push(`**ID:** ${oldPlugin.id} → ${pluginData.id ?? null}`);
        }
        if (oldPlugin.type !== pluginData.type) {
          changes.push(`**Type:** ${oldPlugin.type} → ${pluginData.type}`);
        }
        if (oldPlugin.state !== pluginData.state) {
          changes.push(`**State:** ${oldPlugin.state} → ${pluginData.state}`);
        }

        oldPlugin.dname = pluginData.dname;
        oldPlugin.description = pluginData.description;
        oldPlugin.version = pluginData.version ?? null;
        oldPlugin.eaVersion = pluginData.eaVersion ?? null;
        oldPlugin.link = pluginData.link ?? null;
        oldPlugin.id = pluginData.id ?? null;
        oldPlugin.type = pluginData.type;
        oldPlugin.state = pluginData.state;

        await DBManager.editPlugin(oldPlugin);
        await Logger.BotLog(
          EmbedCreator.Info('__Plugin Edited!__\n' + `>>> -# Sender: ${userData.name}\n` + `**Plugin:** ${oldPlugin.name}\n${changes.join('\n')}`)
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
