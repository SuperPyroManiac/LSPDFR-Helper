import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Cache } from '../../Cache';
import { EmbedCreator } from '../Messages/EmbedCreator';
import { AhOpenCase } from '../../interaction-handlers/_CustomIds';
import { Logger } from '../Messages/Logger';

export class AhChannel {
  public static async UpdateCaseMsg(serverId: string) {
    try {
      const description =
        '\n> The AutoHelper can read a variety of file types and will attempt to find issues. Currently supported log files are **RagePluginHook**, **ELS**, and **ASI** logs. The AutoHelper can also parse **.xml** and **.meta** files as well.' +
        '\n> Please note that frequent issues can often be detected, but human assistance may be required for more advanced problems. Its a robot made by a human, so it may not always be correct.' +
        `\n\n## ${process.env['ALERT']!} __AutoHelper Terms Of Use__` +
        "\n> - Do not send modified logs. To 'test' the bot is not a valid excuse." +
        '\n> - Do not upload logs or files greater than **__3MB__**.' +
        '\n> - Do not spam cases. You can upload multiple logs to a single case.' +
        `\n\n## ${process.env['QUESTION']!} __Other Info__` +
        '\n> Anyone can join and assist in cases, using /JoinCase' +
        "\n> You can add this bot to your server regardless of size! You may also use its commands in ***any*** server by adding it to your account! Just click the user then select 'add app'!" +
        '\n' +
        '\n\n> __Managed by: SuperPyroManiac & Hammer__\n-# More information at: https://dsc.PyrosFun.com';
      const server = Cache.getServer(serverId);
      if (!server || !server.ahChId || server.ahChId === '0' || !server.autoSupport) return;
      const ch = await server.getGuild()?.channels.fetch(server.ahChId);
      if (!ch || !ch.isTextBased()) return;
      const emb = EmbedCreator.Support('__LSPDFR AutoHelper__');
      let msg = (await ch.messages.fetch({ limit: 10 })).find((x) => x.embeds[0]?.description?.includes('LSPDFR AutoHelper'));
      if (!msg) msg = await ch.send({ embeds: [EmbedCreator.Loading('__Starting...__')] });
      emb.data.description += description;
      await msg.edit({
        embeds: [emb],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId(AhOpenCase).setLabel('Open Case').setStyle(ButtonStyle.Success).setEmoji(process.env['SUCCESS']!),
            new ButtonBuilder().setURL('https://www.pyrosfun.com/').setLabel('Bot Website').setStyle(ButtonStyle.Link),
            new ButtonBuilder().setURL('https://www.paypal.com/donate/?hosted_button_id=XPVRV3WJKGFW2').setLabel('Donations').setStyle(ButtonStyle.Link),
          ]),
        ],
      });
    } catch (error) {
      await Logger.ErrLog(`Error while trying to update AutoHelper message for ${serverId}\n`);
    }
  }

  public static async RefreshHelperMsg(_serverId: string) {
    //TODO: Create a channel based autohelper instead of a case based one.
  }
}
