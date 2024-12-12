import { codeBlock } from 'discord.js';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { APIManager } from './APIManager';
import { container } from '@sapphire/framework';

export class ErrorReport {
  public static init() {
    const app = APIManager.getApp();

    app.post('/error', async (req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        const encryptedMessage = body;
        const decryptedMessage = this.decryptMessage(encryptedMessage, process.env.ENCRYPTION_KEY!);

        if (!decryptedMessage.endsWith(process.env.ENCRYPTION_KEY!)) return;
        if (!decryptedMessage.includes('%')) return;

        const delimiterIndex = decryptedMessage.indexOf('%');
        if (delimiterIndex === -1) return;

        const plug = decryptedMessage.substring(0, delimiterIndex);
        let err = decryptedMessage.substring(delimiterIndex + 1);
        err = err.substring(0, err.length - process.env.ENCRYPTION_KEY!.length).trim();

        const parts = err.split(' at ', 2);
        const errorParts = parts[0].split(': ', 2);
        const errorType = errorParts[0];
        const errorMessage = errorParts[1];
        const stackTrace = parts.length > 1 ? parts[1] : '';

        const ch = await container.client.channels.fetch('1291247289536352257');
        if (ch && ch.isThread())
          await ch.send({
            embeds: [EmbedCreator.Warning(`__${plug} Auto Report__\n**${errorType}**\n\n${codeBlock(errorMessage)}\n**Stack Trace:**\n${codeBlock(stackTrace)}`)],
          });

        res.sendStatus(200);
      });
    });
  }

  private static decryptMessage(encryptedMessage: string, key: string): string {
    const messageBytes = Buffer.from(encryptedMessage, 'base64');
    const keyBytes = Buffer.from(key);

    for (let i = 0; i < messageBytes.length; i++) {
      messageBytes[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return messageBytes.toString('utf8');
  }
}
