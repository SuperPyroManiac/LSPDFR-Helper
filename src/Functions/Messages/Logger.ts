import { EmbedBuilder, hyperlink } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { Attachment } from 'discord.js';
//TODO: Add loggers for missing plugins, blame, etc. Totally overhaul this garbage.

export abstract class Logger {
  static async ErrLog(message: string) {
    const ch = container.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL!);
    if (message.length >= 2000) {
      if (ch?.isSendable()) await ch.send(`### __Error Logged__\r\n${codeBlock(message.substring(0, 1850))}`);
      return;
    }
    if (ch?.isSendable()) await ch.send(`### __Error Logged__\r\n${codeBlock(message)}`);
  }

  static async BotLog(message: EmbedBuilder | string, attachment?: Attachment): Promise<void> {
    const ch = container.client.channels.cache.get(process.env.BOT_LOG_CHANNEL!);
    if (attachment && attachment.size / 1000000 > 24) {
      if (typeof message === 'string') message == message + `\r\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`;
      else if (message instanceof EmbedBuilder)
        message.setDescription(message.data.description + `\r\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`);
      attachment = undefined;
    }
    if (attachment) {
      if (ch?.isSendable() && typeof message === 'string') await ch.send({ content: message, files: [attachment] });
      else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message], files: [attachment] });
    } else {
      if (ch?.isSendable() && typeof message === 'string') await ch.send(message);
      else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message] });
    }
  }

  static async ServerLog(message: EmbedBuilder | string, attachment?: Attachment): Promise<void> {
    const ch = container.client.channels.cache.get(process.env.SERVER_LOG_CHANNEL!);
    if (attachment && attachment.size / 1000000 > 24) {
      if (typeof message === 'string') message == message + `\r\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`;
      else if (message instanceof EmbedBuilder)
        message.setDescription(message.data.description + `\r\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`);
      attachment = undefined;
    }
    if (attachment) {
      if (ch?.isSendable() && typeof message === 'string') await ch.send({ content: message, files: [attachment] });
      else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message], files: [attachment] });
    } else {
      if (ch?.isSendable() && typeof message === 'string') await ch.send(message);
      else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message] });
    }
  }

  static async UserLog(message: EmbedBuilder | string, attachment?: Attachment): Promise<void> {
    const ch = container.client.channels.cache.get(process.env.USER_LOG_CHANNEL!);
    if (attachment && attachment.size / 1000000 > 24) {
      if (typeof message === 'string') message == message + `\r\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`;
      else if (message instanceof EmbedBuilder)
        message.setDescription(message.data.description + `\r\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`);
      attachment = undefined;
    }
    if (attachment) {
      if (ch?.isSendable() && typeof message === 'string') await ch.send({ content: message, files: [attachment] });
      else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message], files: [attachment] });
    } else {
      if (ch?.isSendable() && typeof message === 'string') await ch.send(message);
      else if (ch?.isSendable() && message instanceof EmbedBuilder) await ch.send({ embeds: [message] });
    }
  }
}
