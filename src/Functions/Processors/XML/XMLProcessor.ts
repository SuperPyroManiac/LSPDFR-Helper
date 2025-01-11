import { codeBlock } from '@sapphire/utilities';
import { EmbedCreator } from '../../Messages/EmbedCreator';
import { XMLValidator } from './XMLValidator';
import { Message, MessageContextMenuCommandInteraction } from 'discord.js';

export class XMLProcessor {
  private url: string;
  private name: string;

  public constructor(url: string, filename: string) {
    this.url = url;
    this.name = filename;
  }

  public async SendReply(interaction: MessageContextMenuCommandInteraction | Message) {
    const data = await XMLValidator.validate(this.url);
    const emb = EmbedCreator.Support('__XML Info__\r\n\r\n');
    if (data === 'valid')
      emb.data.description += `${process.env['SUCCESS']} **__${this.name} is Valid!__**\r\n>>> -# XML file is valid! Though keep in mind this does not know if there is mistakes in the data itself!`;
    else emb.data.description += `${process.env['ALERT']} **__${this.name} is Invalid!__**\r\n>>> -# An issue was detected!\r\n\r\n${codeBlock('xml', data)}`;
    if (interaction instanceof MessageContextMenuCommandInteraction) return interaction.editReply({ embeds: [emb] });
    return interaction.reply({ embeds: [emb] });
  }
  //TODO: Add send to user button for command.
}
