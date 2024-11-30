import { EmbedBuilder } from 'discord.js';

export abstract class EmbedCreator {
  static Error(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Red').setDescription(bold ? `### :no_entry: ${msg}` : `:no_entry: ${msg}`);
  }

  static Warning(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('Gold').setDescription(bold ? `### :warning: ${msg}` : `:warning: ${msg}`);
  }

  static Info(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('DarkBlue').setDescription(bold ? `### :grey_exclamation: ${msg}` : `:grey_exclamation: ${msg}`);
  }

  static Success(msg: string, bold: boolean = true): EmbedBuilder {
    return new EmbedBuilder().setColor('DarkGreen').setDescription(
      bold ? `### <:yes:1312131833709727775> ${msg}` : `<:yes:1312131833709727775> ${msg}` //TODO: Make these not hardcoded
    );
  }
}
