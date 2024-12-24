import { EmbedBuilder } from 'discord.js';

export class EmbedCreator {
  public static Error(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Red').setDescription(bold ? `## ${process.env['ERROR']} ${msg}` : `${process.env['ERROR']} ${msg}`);
  }

  public static Alert(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Red').setDescription(bold ? `## ${process.env['ALERT']} ${msg}` : `${process.env['ALERT']} ${msg}`);
  }

  public static Warning(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Gold').setDescription(bold ? `## ${process.env['WARNING']} ${msg}` : `${process.env['WARNING']} ${msg}`);
  }

  public static Question(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Blue').setDescription(bold ? `## ${process.env['QUESTION']} ${msg}` : `${process.env['QUESTION']} ${msg}`);
  }

  public static Info(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Blue').setDescription(bold ? `## ${process.env['INFO']} ${msg}` : `${process.env['INFO']} ${msg}`);
  }

  public static Success(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Green').setDescription(bold ? `## ${process.env['SUCCESS']} ${msg}` : `${process.env['SUCCESS']} ${msg}`);
  }

  public static Loading(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Blue').setDescription(bold ? `## ${process.env['LOADING']} ${msg}` : `${process.env['LOADING']} ${msg}`);
  }

  public static Support(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder()
      .setColor('Gold')
      .setDescription(bold ? `## ${process.env['CHECKLIST']} ${msg}` : `${process.env['SUPPORT']} ${msg}`)
      .setThumbnail('https://i.imgur.com/ZbwmXtr.png');
    //.setThumbnail('https://i.imgur.com/bPWj8aV.png');
  }

  public static AddBlanks(count: number): string {
    return Array(count).fill('\u200b ').join('');
  }
}
