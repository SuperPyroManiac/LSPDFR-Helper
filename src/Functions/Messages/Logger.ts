import { EmbedBuilder } from '@discordjs/builders';
import { container } from '@sapphire/framework';
//TODO: Add loggers for missing plugins, blame, etc. Totally overhaul this garbage.

export abstract class Logger {
  static async ErrLog(message: string) {
    const ch = container.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL!);
    if (message.length > 200) {
      if (ch?.isSendable()) await ch.send(`### __Error Logged__\r\n\`\`\`${message.substring(0, 1850)}\`\`\``);
      return;
    }
    if (ch?.isSendable()) await ch.send(`### __Error Logged__\r\n\`\`\`${message}\`\`\``);
  }

  static async BotLog(message: EmbedBuilder | string): Promise<void> {
    const ch = container.client.channels.cache.get(process.env.BOT_LOG_CHANNEL!);

    if (ch?.isSendable() && typeof message === 'string') await ch.send(message);
    else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message] });
  }

  static async ServerLog(message: EmbedBuilder | string): Promise<void> {
    const ch = container.client.channels.cache.get(process.env.SERVER_LOG_CHANNEL!);

    if (ch?.isSendable() && typeof message === 'string') await ch.send(message);
    else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message] });
  }

  static async UserLog(message: EmbedBuilder | string): Promise<void> {
    const ch = container.client.channels.cache.get(process.env.BOT_LOG_CHANNEL!);

    if (ch?.isSendable() && typeof message === 'string') await ch.send(message);
    else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message] });
  }
}
