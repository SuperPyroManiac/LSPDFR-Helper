import { Cache } from '../../Cache';
import { CloseCase } from '../AutoHelper/CloseCase';
import { EmbedCreator } from '../Messages/EmbedCreator';

export class CaseValidation {
  static async VerifyOpenCases(): Promise<number> {
    let cnt = 0;
    for (const cs of Cache.getCases().filter((x) => x.open)) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!Cache.getServer(cs.serverId)?.enabled) {
        await CloseCase.Close(cs, true);
        cnt++;
      }

      if (cs.isExpired()) {
        await CloseCase.Close(cs);
        cnt++;
      }

      if (Cache.getUser(cs.ownerId!)?.banned) {
        await cs.getAhChannel()?.send({
          embeds: [
            EmbedCreator.Error(
              `__Banned!__\r\n-# You are banned from using this bot!\r\n>>> It has been determined that you abused the features of this bot and your access revoked! You may dispute this by vising our Discord.`
            ),
          ],
        });
        await CloseCase.Close(cs);
        cnt++;
      }
    }
    return cnt;
  }
}
