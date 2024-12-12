import { Case } from '../../CustomTypes/MainTypes/Case';
import { EmbedCreator } from '../Messages/EmbedCreator';

export abstract class JoinCase {
  static async Join(userId: string, ac: Case): Promise<boolean> {
    const ch = ac.getAhChannel();
    if (ch?.members.cache.has(userId)) return false;
    ch?.members.add(userId);
    ch?.send({ embeds: [EmbedCreator.Info(`__<@${userId}> has joined!__`)] });
    return true;
  }
}
