import { DBManager } from '../../../Functions/DBManager';
import { Logger } from '../../../Functions/Messages/Logger';
import { APIManager } from '../../APIManager';
import { Request, Response } from 'express';
import { EmbedCreator } from '../../../Functions/Messages/EmbedCreator';

export class EditUser {
  public static init() {
    const app = APIManager.getApp();

    app.post('/SiteConnect/EditUser', async (req: Request, res: Response) => {
      const authToken = req.headers['x-site-auth'];

      if (authToken !== process.env['WEBSITE_KEY']) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { userData } = req.body;

      if (!userData) {
        res.status(400).json({ error: 'Missing user data' });
        return;
      }

      try {
        const oldUser = await DBManager.getUser(userData.id);
        if (!oldUser) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        const changes: string[] = [];

        if (oldUser.banned !== userData.banned) {
          changes.push(`**Banned:** ${oldUser.banned} → ${userData.banned}`);
        }
        if (oldUser.botEditor !== userData.botEditor) {
          changes.push(`**Editor Access:** ${oldUser.botEditor} → ${userData.botEditor}`);
        }
        if (oldUser.botAdmin !== userData.botAdmin) {
          changes.push(`**Admin Access:** ${oldUser.botAdmin} → ${userData.botAdmin}`);
        }

        oldUser.banned = userData.banned;
        oldUser.botEditor = userData.botEditor;
        oldUser.botAdmin = userData.botAdmin;

        await DBManager.editUser(oldUser);
        await Logger.BotLog(
          EmbedCreator.Info(
            '__User Edited!__\n' +
              `>>> -# Sender: ${userData.name}\n` +
              `**User ID:** ${oldUser.id}\n**Username:** ${oldUser.name}
          ${changes.join('\n')}`
          )
        );

        res.status(200).json({
          success: true,
          message: `User ${oldUser.id} processed successfully`,
        });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
}
