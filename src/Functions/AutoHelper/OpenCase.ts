import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ThreadAutoArchiveDuration } from 'discord.js';
import { Cache } from '../../Cache';
import { EmbedCreator } from '../Messages/EmbedCreator';
import { AhMarkComplete } from '../../interaction-handlers/_CustomIds';
import { Case } from '../../CustomTypes/MainTypes/Case';
import { DBManager } from '../DBManager';

export abstract class OpenCase {
  static async Create(userId: string, guildId: string): Promise<boolean> {
    const caseId = this.generateCaseId();
    const server = Cache.getServer(guildId);
    if (!server || !server.getGuild() || !server.ahChId) return false;
    const ahCh = await server.getGuild()?.channels.fetch(server.ahChId);
    if (!ahCh || ahCh.type !== 0) return false;
    const ch = await ahCh.threads.create({
      name: `AutoHelper - Case: ${caseId}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
      type: ChannelType.PrivateThread,
    });
    let msg = {
      embeds: [
        EmbedCreator.Support(
          `__AutoHelper Case: ${caseId}__\n` +
            '> **You have opened a new case! You can upload the following files to be automatically checked:**\n' +
            '> - RagePluginHook.log\n' +
            '> - ELS.log\n' +
            '> - asiloader.log\n' +
            '> - ScriptHookVDotNet.log\n' +
            '> - .xml and .meta files\n\n' +
            '-# Do not abuse the bot by spamming it or sending altered logs. Your access may be revoked for detected abuse.\n\n' +
            '__This bot is maintained by https://dsc.PyrosFun.com__'
        ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder().setLabel('Mark Complete').setStyle(ButtonStyle.Success).setEmoji(process.env.SUCCESS!).setCustomId(AhMarkComplete),
        ]),
      ],
    };

    await ch.send(msg);
    await ch.members.add(userId);

    const newCase = new Case(caseId);
    newCase.ownerId = userId;
    newCase.channelId = ch.id;
    newCase.serverId = guildId;
    await DBManager.createCase(newCase);
    Cache.updateCases((await DBManager.getCases()) ?? []);

    //TODO: Update Monitor
    return true;
  }

  private static generateCaseId(): string {
    let id: string;
    do {
      id = Math.random().toString(36).substring(2, 10);
    } while (Cache.getCase(id));
    return id;
  }
}
