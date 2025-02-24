import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Cache } from '../../Cache';
import { EmbedCreator } from '../Messages/EmbedCreator';
import { AhOpenCase } from '../../interaction-handlers/_CustomIds';
import { Logger } from '../Messages/Logger';
import { DBManager } from '../DBManager';
import { AhType } from '../../CustomTypes/Enums/AhType';

export class AhChannel {
  private static lastUpdateTime = new Map<string, number>();
  private static updateQueue = new Map<string, NodeJS.Timeout>();
  private static COOLDOWN_MS = 5000;

  private static throttle(key: string, fn: () => Promise<void>) {
    const now = Date.now();
    const lastUpdate = this.lastUpdateTime.get(key) || 0;

    clearTimeout(this.updateQueue.get(key));

    if (now - lastUpdate < this.COOLDOWN_MS) {
      this.updateQueue.set(
        key,
        setTimeout(
          () => {
            this.lastUpdateTime.set(key, Date.now());
            void fn();
          },
          this.COOLDOWN_MS - (now - lastUpdate)
        )
      );
      return;
    }

    this.lastUpdateTime.set(key, now);
    void fn();
  }

  public static async UpdateTicketMsg(serverId: string) {
    try {
      const description =
        '\n> You can check files for common issues here. \n> Currently supported files:\n> - **RagePluginHook Logs**\n> - **ELS Logs**\n> - **ASI Logs** \n> - **.xml Files**\n> - **.meta Files**\n> - **Images**' +
        '\n> Please note that frequent issues can often be detected, but human assistance may be required for more advanced problems.' +
        `\n\n## ${process.env['ALERT']!} __AutoHelper Rules__` +
        '\n> - No modified logs' +
        '\n> - No files bigger than **__5MB__**.' +
        '\n> - No spamming cases or files rapidly.' +
        `\n\n## ${process.env['QUESTION']!} __Other Info__` +
        '\n> Anyone can join and assist in cases, using /JoinCase' +
        "\n> You can add this bot to your server regardless of size! You may also use its commands in ***any*** server by adding it to your account! Just click the bot then select 'add app'!" +
        '\n' +
        '\n\n> __Created by: SuperPyroManiac__\n-# To contact me visit: https://dsc.PyrosFun.com';

      const server = Cache.getServer(serverId);
      if (!server || !server.ahChId || server.ahChId === '0' || server.ahType !== AhType.TICKET) return;
      const ch = await server
        .getGuild()
        ?.channels.fetch(server.ahChId)
        .catch(async () => {
          {
            server.ahChId = '0';
            await DBManager.editServer(server);
            return;
          }
        });
      if (!ch || !ch.isTextBased()) return;
      const emb = EmbedCreator.Support('__LSPDFR AutoHelper__');
      let msg = (await ch.messages.fetch({ limit: 10 })).find((x) => x.embeds[0]?.description?.includes('Created by: SuperPyroManiac'));
      if (!msg) msg = await ch.send({ embeds: [EmbedCreator.Loading('__Starting...__')] });
      emb.data.description += description;
      await msg.edit({
        embeds: [emb],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId(AhOpenCase).setLabel('Open Case').setStyle(ButtonStyle.Success).setEmoji(process.env['SUCCESS']!),
            new ButtonBuilder().setURL('https://www.pyrosfun.com/helper').setLabel('Add To Your Server').setStyle(ButtonStyle.Link),
            new ButtonBuilder().setURL('https://www.paypal.com/donate/?hosted_button_id=XPVRV3WJKGFW2').setLabel('Donations').setStyle(ButtonStyle.Link),
          ]),
        ],
      });
    } catch (error) {
      await Logger.ErrLog(`Error while trying to update AutoHelper message for ${serverId}\n${error}`);
    }
  }

  public static async UpdateChannelMsg(serverId: string) {
    try {
      this.throttle(serverId, async () => {
        const description =
          '\n-# You can check files for common issues here.\n-# Simply upload a file here to check it.\n\n' +
          `${process.env['QUESTION']!} **__Currently supported files:__**\n> - **RagePluginHook Logs, ELS Logs, ASI Logs**\n> - **.xml Files, .meta Files, and Images**` +
          `\n\n${process.env['ALERT']!} **__AutoHelper Rules__**` +
          '\n> - No modified logs' +
          '\n> - No files bigger than **__5MB__**.' +
          '\n> - No spamming cases or files rapidly.' +
          '\n' +
          '\n\n> __Created by: SuperPyroManiac__\n-# To contact me visit: https://dsc.PyrosFun.com';

        const server = Cache.getServer(serverId);
        if (!server || !server.ahChId || server.ahChId === '0' || server.ahType === AhType.TICKET) return;
        const ch = await server
          .getGuild()
          ?.channels.fetch(server.ahChId)
          .catch(async () => {
            {
              server.ahChId = '0';
              await DBManager.editServer(server);
              return;
            }
          });
        if (!ch || !ch.isTextBased()) return;
        const msg = (await ch.messages.fetch({ limit: 10 })).find((x) => x.embeds[0]?.description?.includes('Created by: SuperPyroManiac'));
        if (msg) await msg.delete();
        const emb = EmbedCreator.Support('__LSPDFR AutoHelper__');
        emb.data.description += description;
        await ch.send({
          embeds: [emb],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
              ...(server.ahType === AhType.HYBRID
                ? [new ButtonBuilder().setCustomId(AhOpenCase).setLabel('Open Case').setStyle(ButtonStyle.Success).setEmoji(process.env['SUCCESS']!)]
                : []),
              new ButtonBuilder().setURL('https://www.pyrosfun.com/helper').setLabel('Add To Your Server').setStyle(ButtonStyle.Link),
              new ButtonBuilder().setURL('https://www.paypal.com/donate/?hosted_button_id=XPVRV3WJKGFW2').setLabel('Donations').setStyle(ButtonStyle.Link),
            ]),
          ],
        });
      });
    } catch (error) {
      await Logger.ErrLog(`Error while trying to update AutoHelper message for ${serverId}\n${error}`);
    }
  }
}
