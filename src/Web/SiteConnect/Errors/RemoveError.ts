import { codeBlock } from 'discord.js';
import { DBManager } from '../../../Functions/DBManager';
import { Logger } from '../../../Functions/Messages/Logger';
import { APIManager } from '../../APIManager';
import { Request, Response } from 'express';
import { EmbedCreator } from '../../../Functions/Messages/EmbedCreator';

export class RemoveError {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/RemoveError', async (req: Request, res: Response) => {
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

        await DBManager.deleteError(oldError.id);
        await Logger.BotLog(
          EmbedCreator.Warning(
            '__Removed Error!__\n ' +
              `>>> -# Sender: ${userData.name}\n` +
              `**ID:** ${oldError.id}\n` +
              `**Pattern:** ${codeBlock(oldError.pattern!)}\n` +
              `**Solution:** ${codeBlock(oldError.solution!)}\n` +
              `**Description:** ${codeBlock(oldError.description!)}\n` +
              `**String Match:** ${oldError.stringMatch}\n` +
              `**Level:** ${oldError.level}\n`
          )
        );

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
