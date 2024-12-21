import { Events, Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import { Cache } from '../Cache';
import { Reports } from '../Functions/Messages/Reports';
import { RPHProcessor } from '../Functions/Processors/RPH/RPHProcessor';
import { RPHValidator } from '../Functions/Processors/RPH/RPHValidator';
import { Logger } from '../Functions/Messages/Logger';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { XMLProcessor } from '../Functions/Processors/XML/XMLProcessor';
import { ELSValidator } from '../Functions/Processors/ELS/ELSValidator';
import { ELSProcessor } from '../Functions/Processors/ELS/ELSProcessor';
import { ASIProcessor } from '../Functions/Processors/ASI/ASIProcessor';
import { ASIValidator } from '../Functions/Processors/ASI/ASIValidator';
import { addDays, differenceInMinutes } from 'date-fns';
import { DBManager } from '../Functions/DBManager';
import { UsersValidation } from '../Functions/Validations/Users';

export class MessageCreateListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  public async run(msg: Message) {
    if (this.container.client.shard?.ids[0] !== 0) return;
    await UsersValidation.Verify(msg.author);

    if ((await Cache.getCases()).some((c) => c.channelId === msg.channelId && c.open)) {
      await this.ahChannels(msg);
    }
  }

  private async ahChannels(msg: Message) {
    const cs = (await Cache.getCases()).find((c) => c.channelId === msg.channelId && c.open);
    if (!cs || msg.author.id !== cs?.ownerId) return;
    const acceptedTypes = ['ragepluginhook', 'els', 'asiloader', '.xml', '.meta'];

    const currentTime = new Date();
    if (differenceInMinutes(cs.expireDate, currentTime) <= 1435) {
      cs.expireDate = addDays(currentTime, 1);
      await DBManager.editCase(cs);
    }

    //TODO: Text and IMG recog - Fuzzy alt fast-fuzzy | IMG has direct port
    if (msg.attachments.size === 0) return;
    for (const a of msg.attachments.values()) {
      //prettier-ignore
      {
        if (a.name.endsWith('.rcr')) await msg.reply({embeds: [EmbedCreator.Support('__LSPDFR AutoHelper__\r\n>>> This file is not supported! Please send `RagePluginHook.log` from your main GTA directory instead. Not the logs folder.'),],});
        if (a.name.endsWith('.exe') || a.name.endsWith('.dll') || a.name.endsWith('.asi')) await msg.reply({ embeds: [EmbedCreator.Error(`__LSPDFR AutoHelper__\r\n${msg.author}\r\n>>> Do not upload executable files!\r\nFile: ${a.name}`)] });
        if (a.name === 'message.txt') await msg.reply({embeds: [EmbedCreator.Support("__LSPDFR AutoHelper__\r\n>>> Please don't copy and paste the log! Please send `RagePluginHook.log` from your main GTA directory instead by dragging it into Discord."),],});
      }

      if (acceptedTypes.some((x) => a.name.toLowerCase().includes(x))) {
        if (a.size / 1000000 > 10) {
          await Reports.largeLog(msg, a, true);
          return;
        } else if (a.size / 1000000 > 3) {
          await Reports.largeLog(msg, a);
          return;
        }
        const fileName = a.name.toLowerCase();
        if (fileName.includes('ragepluginhook') && fileName.endsWith('.log')) {
          const rphProc = new RPHProcessor(await RPHValidator.validate(a.url), msg.id);
          if (rphProc.log.logModified) return Reports.modifiedLog(msg, a);
          await rphProc.SendReply(msg).catch(async (e) => {
            await Logger.ErrLog(`Failed to process file!\r\n${e}`);
            await msg.reply({ embeds: [EmbedCreator.Error('__Failed to process file!__\r\n>>> The error has been sent to the bot developer!')] });
          });
        } else if (fileName.includes('els') && fileName.endsWith('.log')) {
          const elsProc = new ELSProcessor(await ELSValidator.validate(a.url), msg.id);
          await elsProc.SendReply(msg).catch(async (e) => {
            await Logger.ErrLog(`Failed to process file!\r\n${e}`);
            await msg.reply({ embeds: [EmbedCreator.Error('__Failed to process file!__\r\n>>> The error has been sent to the bot developer!')] });
          });
        } else if (fileName.includes('asiloader') && fileName.endsWith('.log')) {
          const asiProc = new ASIProcessor(await ASIValidator.validate(a.url), msg.id);
          await asiProc.SendReply(msg).catch(async (e) => {
            await Logger.ErrLog(`Failed to process file!\r\n${e}`);
            await msg.reply({ embeds: [EmbedCreator.Error('__Failed to process file!__\r\n>>> The error has been sent to the bot developer!')] });
          });
        }

        if (a.name.endsWith('.xml') || a.name.endsWith('.meta')) {
          const xmlProc = new XMLProcessor(a.url);
          await xmlProc.SendReply(msg);
        }
      }
    }
  }
}
