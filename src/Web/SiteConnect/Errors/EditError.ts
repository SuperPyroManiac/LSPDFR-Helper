import { codeBlock } from 'discord.js';
import { DBManager } from '../../../Functions/DBManager';
import { Logger } from '../../../Functions/Messages/Logger';
import { APIManager } from '../../APIManager';
import { Request, Response } from 'express';
import { EmbedCreator } from '../../../Functions/Messages/EmbedCreator';

export class EditError {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/EditError', async (req: Request, res: Response) => {
      const authToken = req.headers['x-site-auth'];

      if (authToken !== process.env['WEBSITE_KEY']) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { errorData, userData } = req.body;

      if (!errorData) {
        res.status(400).json({ error: 'Missing error data' });
        return;
      }

      try {
        const oldError = await DBManager.getError(errorData.id);
        if (!oldError) {
          res.status(404).json({ error: 'Error not found' });
          return;
        }

        const changes: string[] = [];

        if (oldError.pattern !== errorData.pattern) {
          changes.push(`**Pattern:** ${codeBlock(oldError.pattern!)} → ${codeBlock(errorData.pattern!)}`);
        }
        if (oldError.solution !== errorData.solution) {
          changes.push(`**Solution:** ${codeBlock(oldError.solution!)} → ${codeBlock(errorData.solution!)}`);
        }
        if (oldError.description !== errorData.description) {
          changes.push(`**Description:** ${codeBlock(oldError.description!)} → ${codeBlock(errorData.description!)}`);
        }
        if (oldError.stringMatch !== errorData.stringMatch) {
          changes.push(`**String Match:** ${oldError.stringMatch} → ${errorData.stringMatch}`);
        }
        if (oldError.level !== errorData.level) {
          changes.push(`**Level:** ${oldError.level} → ${errorData.level}`);
        }

        oldError.pattern = errorData.pattern;
        oldError.solution = errorData.solution;
        oldError.description = errorData.description;
        oldError.stringMatch = errorData.stringMatch;
        oldError.level = errorData.level;

        await DBManager.editError(oldError);
        await Logger.BotLog(EmbedCreator.Info('__Error Edited!__\n' + `>>> -# Sender: ${userData.name}\n` + `**Error ID:** ${oldError.id}\n${changes.join('\n')}`));

        res.status(200).json({
          success: true,
          message: `Error ${oldError.id} processed successfully`,
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
