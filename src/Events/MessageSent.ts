import { AttachmentBuilder, EmbedBuilder, Message } from 'discord.js';

export function handleMsgSent(message: Message) {
  if (message.author.bot) return;
  message.reply(`${message.guildId}`);
}
