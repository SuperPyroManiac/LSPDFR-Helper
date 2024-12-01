import { EmbedBuilder } from 'discord.js';

export abstract class EmbedCreator {
  static Error(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Red').setDescription(bold ? `## ${process.env.ERROR} ${msg}` : `${process.env.ERROR} ${msg}`);
  }

  static Alert(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Red').setDescription(bold ? `## ${process.env.ALERT} ${msg}` : `${process.env.ALERT} ${msg}`);
  }

  static Warning(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Gold').setDescription(bold ? `## ${process.env.WARNING} ${msg}` : `${process.env.WARNING} ${msg}`);
  }

  static Question(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Blue').setDescription(bold ? `## ${process.env.QUESTION} ${msg}` : `${process.env.QUESTION} ${msg}`);
  }

  static Info(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Blue').setDescription(bold ? `## ${process.env.INFO} ${msg}` : `${process.env.INFO} ${msg}`);
  }

  static Support(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Blue').setDescription(bold ? `## ${process.env.SUPPORT} ${msg}` : `${process.env.SUPPORT} ${msg}`);
  }

  static Success(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Green').setDescription(bold ? `## ${process.env.SUCCESS} ${msg}` : `${process.env.SUCCESS} ${msg}`);
  }

  static Loading(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Blue').setDescription(bold ? `## ${process.env.LOADING} ${msg}` : `${process.env.LOADING} ${msg}`);
  }
}
