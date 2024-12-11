import { codeBlock } from '@sapphire/utilities';
import { EmbedCreator } from '../../Messages/EmbedCreator';
import { XMLValidator } from './XMLValidator';
import { Message, MessageContextMenuCommandInteraction } from 'discord.js';

export class XMLProcessor {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async SendReply(interaction: MessageContextMenuCommandInteraction | Message) {
    const data = await XMLValidator.validate(this.url);
    const emb = EmbedCreator.Support('__XML Info__\r\n*Parsed XML Results*\r\n\r\n');
    if (data === 'valid')
      emb.data.description += `${process.env.SUCCESS} **__XML is Valid!__**\r\n>>> -# XML file is valid! Though keep in mind this does not know if there is mistakes in the data itself!`;
    else emb.data.description += `${process.env.ALERT} **__XML is Invalid!__**\r\n>>> -# An issue was detected!\r\n\r\n${codeBlock('xml', data)}`;
    if (interaction instanceof MessageContextMenuCommandInteraction) return await interaction.editReply({ embeds: [emb] });
    return await interaction.reply({ embeds: [emb] });
  }
}
