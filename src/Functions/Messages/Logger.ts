import { EmbedBuilder, hyperlink } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { Attachment, Message } from 'discord.js';
import { EmbedCreator } from './EmbedCreator';
import { Plugin } from '../../CustomTypes/MainTypes/Plugin';

export class Logger {
  public static async ErrLog(message: string) {
    const ch = container.client.channels.cache.get(process.env['ERROR_LOG_CHANNEL']!);
    if (message.length >= 2000) {
      if (ch?.isSendable()) await ch.send(`### __Error Logged__\n${codeBlock(message.substring(0, 1850))}`);
      return;
    }
    if (ch?.isSendable()) await ch.send(`### __Error Logged__\n${codeBlock(message)}`);
  }

  public static async BotLog(message: EmbedBuilder | string, attachment?: Attachment) {
    const ch = container.client.channels.cache.get(process.env['BOT_LOG_CHANNEL']!);
    if (attachment && attachment.size / 1000000 > 24) {
      if (typeof message === 'string') message = `${message}\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`;
      else if (message instanceof EmbedBuilder)
        message.setDescription(`${message.data.description}\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`);
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

  public static async ServerLog(message: EmbedBuilder | string, attachment?: Attachment) {
    const ch = container.client.channels.cache.get(process.env['SERVER_LOG_CHANNEL']!);
    if (attachment && attachment.size / 1000000 > 24) {
      if (typeof message === 'string') message = `${message}\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`;
      else if (message instanceof EmbedBuilder)
        message.setDescription(`${message.data.description}\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`);
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

  public static async UserLog(message: EmbedBuilder | string, attachment?: Attachment) {
    const ch = container.client.channels.cache.get(process.env['USER_LOG_CHANNEL']!);
    if (attachment && attachment.size / 1000000 > 24) {
      if (typeof message === 'string') message = `${message}\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`;
      else if (message instanceof EmbedBuilder)
        message.setDescription(`${message.data.description}\nFile Too Large To Upload: ${hyperlink('Link', attachment.url)}`);
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

  public static async PluginInfo(missingPlugs: Plugin[], newerPlugs: Plugin[], link: string, msg: Message) {
    if (!link || !msg) return;
    const ch = container.client.channels.cache.get(process.env['MISSING_PLUGINS_CHANNEL']!);
    if (!ch?.isSendable()) return;
    const message = EmbedCreator.Question('__Unknown Plugins / Versions__\n');

    const missingDashListStr = `> - ${missingPlugs.map((plugin) => `${plugin?.name} (${plugin?.version})`).join('\n> - ')}\n`;
    if (missingDashListStr.length > 5 && missingDashListStr.length < 1024) {
      message.setDescription(`${message.data.description}\n${process.env['WARNING']} **Plugins not recognized:** \n${missingDashListStr}`);
    }

    const missmatchDashListStr = `> - ${newerPlugs.map((plugin) => `${plugin?.name} (${plugin?.eaVersion})`).join('\n> - ')}\n`;
    if (missmatchDashListStr.length > 5 && missmatchDashListStr.length < 1024) {
      message.setDescription(`${message.data.description}\n${process.env['WARNING']} **Plugin version newer than DB:** \n${missmatchDashListStr}`);
    }

    let chName = 'User CMD';
    if (msg.channel && !msg.channel.isDMBased()) chName = msg.channel.name;
    message.setDescription(
      `${message.data.description}\n-# **User:** ${msg.member?.user.username ?? 'Unknown'} (${msg.member?.user.id ?? 'Unknown'})\n` +
        `-# **Server:** ${msg.guild?.name ?? 'DM'} (${msg.guild?.id ?? 'N/A'})\n` +
        `-# **Channel:** ${chName} (${msg.channel?.id ?? 'N/A'})\n` +
        `-# **Log Link:** ${hyperlink('Here', link)}`
    );
    if (missingPlugs.length > 0 || newerPlugs.length > 0) await ch.send({ embeds: [message] });
  }
}
