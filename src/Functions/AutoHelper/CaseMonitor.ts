import { time, TimestampStyles } from 'discord.js';
import { Cache } from '../../Cache';
import { EmbedCreator } from '../Messages/EmbedCreator';

export abstract class CaseMonitor {
  static async Update(serverId: string) {
    const server = Cache.getServer(serverId);
    if (!server || !server.ahMonChId) return;
    const ch = server.getGuild()?.channels.cache.get(server.ahMonChId);
    if (!ch || !ch.isTextBased()) return;
    let msg = (await ch.messages.fetch({ limit: 10 })).find((x) => x.embeds[0]?.description?.includes('AutoHelper Cases'));
    if (!msg) msg = await ch.send({ embeds: [EmbedCreator.Loading('__Starting...__')] });
    const cases = Cache.getCases()
      .filter((x) => x.serverId === serverId && x.open)
      .sort((a, b) => a.expireDate.getTime() - b.expireDate.getTime());
    let emb = EmbedCreator.Question(`__Open AutoHelper Cases__`);

    for (const c of cases) {
      if (emb.data.fields?.length === 15) {
        emb.addFields({ name: '..And More', value: 'There are too many cases to show!' });
        break;
      }
      emb.addFields({
        name: `__<#${c.id}>__`,
        value: `>>> Author: <@${c.ownerId}>\nCreated: ${time(c.createDate, TimestampStyles.RelativeTime)} | AutoClose: ${time(c.expireDate, TimestampStyles.RelativeTime)}`,
      });
    }
    if (emb.data.fields?.length === 0) emb.addFields({ name: 'No Cases', value: 'There are no open cases!' });

    await msg.edit({ embeds: [emb] });
  }
}
