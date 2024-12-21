import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Cache } from '../Cache';
import { AutocompleteInteraction, hyperlink, time, TimestampStyles } from 'discord.js';
import { CloseCase } from '../Functions/AutoHelper/CloseCase';
import { Logger } from '../Functions/Messages/Logger';

export class CasesCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: 'cases',
      subcommands: [
        {
          name: 'join',
          chatInputRun: 'caseJoin',
        },
        {
          name: 'find',
          chatInputRun: 'caseFind',
        },
        {
          name: 'close',
          chatInputRun: 'caseClose',
          preconditions: ['ServerManager'],
        },
      ],
    });
  }

  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('cases')
        .setDescription('Case commands')
        .addSubcommand((command) =>
          command
            .setName('join')
            .setDescription('Joins an existing case.')
            .addStringOption((x) => x.setName('caseid').setDescription('ID of the case to join').setRequired(true).setAutocomplete(true))
        )
        .addSubcommand((command) =>
          command
            .setName('find')
            .setDescription('Finds all cases from a user.')
            .addUserOption((x) => x.setName('user').setDescription('User to find cases for').setRequired(true))
        )
        .addSubcommand((command) =>
          command
            .setName('close')
            .setDescription('Closes a case.')
            .addStringOption((x) => x.setName('caseid').setDescription('ID of the case to join').setRequired(true).setAutocomplete(true))
        )
    );
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'join' || subcommand === 'close') {
      const openCases = Cache.getCases().filter((x) => x.open && x.serverId === interaction.guildId);
      return interaction.respond(openCases.map((c) => ({ name: `${Cache.getUser(c.ownerId!)?.name}: ${c.id}`, value: c.id })).slice(0, 25));
    }
  }

  public async caseJoin(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.reply({ embeds: [EmbedCreator.Loading('__Joining Case!__\r\n>>> Currently adding you to the case. Please wait...')], ephemeral: true });

    const cs = Cache.getCase(interaction.options.getString('caseid')!);
    if (!cs) return interaction.editReply({ embeds: [EmbedCreator.Error('__Case Not Found!__\n>>> The case you are trying to join does not exist!')] });
    if (!cs.open) return interaction.editReply({ embeds: [EmbedCreator.Error('__Case Closed!__\n>>> The case you are trying to join is closed!')] });
    try {
      if (await cs.getAhChannel()?.members.fetch(interaction.user.id)) {
        return interaction.editReply({ embeds: [EmbedCreator.Error('__Already In Case!__\n>>> You are already in this case!')] });
      }
    } catch (error) {
      await Logger.ErrLog(`Error fetching user from case channel, they likely left the server! ID: ${interaction.user.id}`);
    }
    await cs.getAhChannel()?.members.add(interaction.user.id);
    await interaction.editReply({ embeds: [EmbedCreator.Success(`__Joined Case!__\n>>> You have been added to: <#${cs.channelId}>`)] });
    return;
  }

  public async caseFind(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.reply({ embeds: [EmbedCreator.Loading('__Finding Cases!__\r\n>>> Currently searching for all cases. Please wait...')], ephemeral: true });

    const usr = interaction.options.getUser('user');
    if (!usr) return interaction.editReply({ embeds: [EmbedCreator.Error('__User Not Found!__\n>>> The user you entered does not exist!')] });
    const cUsr = Cache.getUser(usr.id);
    if (!cUsr) return interaction.editReply({ embeds: [EmbedCreator.Error('__User Not Found!__\n>>> The user you entered does not exist in our DB!')] });
    const cases = Cache.getCases().filter((x) => x.ownerId === cUsr.id && x.serverId === interaction.guildId);
    if (!cases.length) return interaction.editReply({ embeds: [EmbedCreator.Info('__No Cases Found!__\n>>> This user has never opened a case on this server!')] });
    cases.sort((a, b) => b.createDate.getTime() - a.createDate.getTime());
    const embed = EmbedCreator.Info(`__Cases Found!__\n-# Found ${cases.length} cases for ${usr.tag}`);
    for (const c of cases.splice(0, 20)) {
      embed.addFields({
        name: `__Case ID: ${c.id}__`,
        value: `>>> ${hyperlink('**Jump To Case**', `https://discord.com/channels/${c.serverId}/${c.channelId}`)}\n**Created:** ${time(c.createDate, TimestampStyles.RelativeTime)}`,
        inline: true,
      });
    }
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  public async caseClose(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.reply({ embeds: [EmbedCreator.Loading('__Closing Case!__\r\n>>> Currently closing the case. Please wait...')], ephemeral: true });

    const cs = Cache.getCase(interaction.options.getString('caseid')!);
    if (!cs) return interaction.editReply({ embeds: [EmbedCreator.Error('__Case Not Found!__\n>>> The case you are trying to close does not exist!')] });
    if (!cs.open) return interaction.editReply({ embeds: [EmbedCreator.Error('__Case Already Closed!__\n>>> The case is already closed!')] });
    await CloseCase.Close(cs);
    await interaction.editReply({ embeds: [EmbedCreator.Success('__Closed Case!__\n>>> The case was closed successfully!')] });
    return;
  }
}
