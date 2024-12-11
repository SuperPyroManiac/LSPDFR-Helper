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

export class MessageCreateListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  public async run(msg: Message) {
    if (Cache.getCases().some((c) => c.channelId === msg.channelId && c.open)) {
      await this.ahChannels(msg);
    }
  }

  private async ahChannels(msg: Message) {
    const cs = Cache.getCases().find((c) => c.channelId === msg.channelId && c.open);
    if (!cs || msg.author.id !== cs?.ownerId) return;
    const acceptedTypes = ['ragepluginhook', 'els', 'asiloader', '.xml', '.meta'];

    //TODO: Text and IMG recog - Fuzzy alt fast-fuzzy | IMG has direct port
    if (msg.attachments.size === 0) return;
    msg.attachments.forEach(async (a) => {
      if (a.size / 1000000 > 10) {
        Reports.largeLog(msg, a, true);
        return;
      } else if (a.size / 1000000 > 3) {
        Reports.largeLog(msg, a);
        return;
      }
      if (acceptedTypes.some((x) => a.name.toLowerCase().includes(x))) {
        const fileName = a.name.toLowerCase();
        if (fileName.includes('ragepluginhook')) {
          const rphProc = new RPHProcessor(await RPHValidator.validate(a.url), msg.id);
          if (rphProc.log.logModified) return Reports.modifiedLog(msg, a);
          await rphProc.SendReply(msg).catch(async (e) => {
            await Logger.ErrLog(`Failed to process file!\r\n${e}`);
            await msg.reply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
          });
        } else if (fileName.includes('els')) {
          const elsProc = new ELSProcessor(await ELSValidator.validate(a.url), msg.id);
          await elsProc.SendReply(msg).catch(async (e) => {
            await Logger.ErrLog(`Failed to process file!\r\n${e}`);
            await msg.reply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
          });
        } else if (fileName.includes('asiloader')) {
          const asiProc = new ASIProcessor(await ASIValidator.validate(a.url), msg.id);
          await asiProc.SendReply(msg).catch(async (e) => {
            await Logger.ErrLog(`Failed to process file!\r\n${e}`);
            await msg.reply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
          });
        }

        if (a.name.endsWith('.xml') || a.name.endsWith('.meta')) {
          const xmlProc = new XMLProcessor(a.url);
          await xmlProc.SendReply(msg);
        }
      }
    });
  }
}
