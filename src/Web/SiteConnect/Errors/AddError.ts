import { codeBlock } from 'discord.js';
import { DBManager } from '../../../Functions/DBManager';
import { Logger } from '../../../Functions/Messages/Logger';
import { APIManager } from '../../APIManager';
import { Request, Response } from 'express';
import { EmbedCreator } from '../../../Functions/Messages/EmbedCreator';
import { Error } from '../../../CustomTypes/MainTypes/Error';

export class AddError {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/AddError', async (req: Request, res: Response) => {
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
        const newError = new Error();
        newError.pattern = errorData.pattern;
        newError.solution = errorData.solution;
        newError.description = errorData.description;
        newError.stringMatch = errorData.stringMatch;
        newError.level = errorData.level;

        const id = await DBManager.createError(newError);
        await Logger.BotLog(
          EmbedCreator.Info(
            '__Added New Error!__\n ' +
              `>>> -# Sender: ${userData.name}\n` +
              `**ID:** ${id}\n` +
              `**Pattern:** ${codeBlock(newError.pattern!)}\n` +
              `**Solution:** ${codeBlock(newError.solution!)}\n` +
              `**Description:** ${codeBlock(newError.description!)}\n` +
              `**String Match:** ${newError.stringMatch}\n` +
              `**Level:** ${newError.level}\n`
          )
        );

        res.status(200).json({
          success: true,
          message: `Error ${newError.id} processed successfully`,
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
