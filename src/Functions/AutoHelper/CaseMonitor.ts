import { time, TimestampStyles } from 'discord.js';
import { Cache } from '../../Cache';
import { EmbedCreator } from '../Messages/EmbedCreator';
import { Logger } from '../Messages/Logger';
import { DBManager } from '../DBManager';
import { AhType } from '../../CustomTypes/Enums/AhType';

export class CaseMonitor {
  public static async Update(serverId: string) {
    try {
      const server = Cache.getServer(serverId);
      if (!server || !server.ahMonChId || server.ahMonChId === '0') return;
      const ch = await server
        .getGuild()
        ?.channels.fetch(server.ahMonChId)
        .catch(async () => {
          {
            server.ahMonChId = '0';
            await DBManager.editServer(server);
            return;
          }
        });
      if (!ch || !ch.isTextBased()) return;
      let msg = (await ch.messages.fetch({ limit: 10 })).find(
        (x) => x.embeds[0]?.description?.includes('AutoHelper') && x.embeds[0]?.description?.includes('Cases')
      );
      if (!msg) msg = await ch.send({ embeds: [EmbedCreator.Loading('__Starting...__')] });
      const cases = Cache.getCases()
        .filter((x) => x.serverId === serverId && x.open)
        .sort((a, b) => a.expireDate.getTime() - b.expireDate.getTime());
      const emb = EmbedCreator.Question('__Open AutoHelper Cases__');

      for (const c of cases) {
        if (emb.data.fields?.length === 15) {
          emb.addFields({ name: '..And More', value: 'There are too many cases to show!' });
          break;
        }
        emb.addFields({
          name: `__<#${c.channelId}>__`,
          value: `>>> Author: <@${c.ownerId}>\nCreated: ${time(c.createDate, TimestampStyles.RelativeTime)} | AutoClose: ${time(c.expireDate, TimestampStyles.RelativeTime)}`,
        });
      }
      if (server.ahType === AhType.CHANNEL)
        emb.addFields({
          name: 'Channel Mode',
          value: 'Your AutoHelper is set to channel mode, there will never be open cases here! For cases use either the ticket or hybrid modes.',
        });
      if (!emb.data.fields) emb.addFields({ name: 'No Cases', value: 'There are no open cases!' });

      await msg.edit({ embeds: [emb] });
    } catch (error) {
      await Logger.ErrLog(`Error while trying to update case monitor for ${serverId}\n${error}`);
    }
  }
}
