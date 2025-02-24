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
import { fuzzy } from 'fast-fuzzy';
import { Level } from '../CustomTypes/Enums/Level';
import Tesseract from 'tesseract.js';
import { AhType } from '../CustomTypes/Enums/AhType';
import { AhChannel } from '../Functions/AutoHelper/AhChannel';

export class MessageCreateListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  private acceptedTypes = [
    'ragepluginhook',
    'els',
    'asiloader',
    '.xml',
    '.meta',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.bmp',
    '.tiff',
    '.tif',
    '.gif',
    '.pbm',
    '.pgm',
    '.ppm',
  ];

  public async run(msg: Message) {
    await UsersValidation.Verify(msg.author);

    if (Cache.getServers().some((s) => s.ahChId === msg.channelId)) {
      await this.ahChannels(msg);
    }

    if (Cache.getCases().some((c) => c.channelId === msg.channelId && c.open)) {
      await this.ahCases(msg);
    }
  }

  private async ahChannels(msg: Message) {
    if (msg.embeds[0]?.description?.includes('Created by: SuperPyroManiac') || msg.flags.has('Ephemeral')) return;
    if (Cache.getServer(msg.guildId!)?.ahType !== AhType.TICKET) {
      await this.ProcessMessage(msg);
      await AhChannel.UpdateChannelMsg(msg.guildId!);
    }
  }

  private async ahCases(msg: Message) {
    const cs = Cache.getCases().find((c) => c.channelId === msg.channelId && c.open);
    if (!cs || msg.author.id !== cs?.ownerId) return;

    const currentTime = new Date();
    if (differenceInMinutes(cs.expireDate, currentTime) <= 1435) {
      cs.expireDate = addDays(currentTime, 1);
      await DBManager.editCase(cs);
    }
    await this.ProcessMessage(msg);
  }

  private async ProcessMessage(msg: Message) {
    if (msg.content.length > 7) {
      const bestMatch = Cache.getErrors()
        .filter((x) => x.level === Level.PMSG)
        .map((emsg) => ({
          id: emsg.id,
          match: fuzzy(msg.content.toLowerCase(), emsg.pattern?.toLowerCase()!),
          solution: emsg.solution!,
        }))
        .filter((x) => x.match > 0.85)
        .reduce((best, current) => (current.match > best.match ? current : best), { id: 0, match: 0, solution: '' });

      if (bestMatch.match > 0) {
        await msg.reply({
          embeds: [
            EmbedCreator.Support(`__LSPDFR AutoHelper__\n-# Matched with ID: ${bestMatch.id} - ${(bestMatch.match * 100).toFixed(2)}%\n\n>>> ${bestMatch.solution}`),
          ],
        });
      }
    }

    if (msg.attachments.size === 0) return;
    for (const a of msg.attachments.values()) {
      //prettier-ignore
      {
        if (a.name.endsWith('.rcr')) await msg.reply({embeds: [EmbedCreator.Support('__LSPDFR AutoHelper__\r\n>>> This file is not supported! Please send `RagePluginHook.log` from your main GTA directory instead. Not the logs folder.'),],});
        if (a.name.endsWith('.exe') || a.name.endsWith('.dll') || a.name.endsWith('.asi')) await msg.reply({ embeds: [EmbedCreator.Error(`__LSPDFR AutoHelper__\r\n${msg.author}\r\n>>> Do not upload executable files!\r\nFile: ${a.name}`)] });
        if (a.name === 'message.txt') await msg.reply({embeds: [EmbedCreator.Support("__LSPDFR AutoHelper__\r\n>>> Please don't copy and paste the log! Please send `RagePluginHook.log` from your main GTA directory instead by dragging it into Discord."),],});
      }

      if (this.acceptedTypes.some((x) => a.name.toLowerCase().includes(x))) {
        if (a.size / 1000000 > 15) {
          await Reports.largeLog(msg, a, true);
          return;
        } else if (a.size / 1000000 > 5) {
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
        } else if (a.name.endsWith('.xml') || a.name.endsWith('.meta')) {
          const xmlProc = new XMLProcessor(a.url, a.name);
          await xmlProc.SendReply(msg);
        } else if (
          a.name.endsWith('.png') ||
          a.name.endsWith('.jpg') ||
          a.name.endsWith('.jpeg') ||
          a.name.endsWith('.webp') ||
          a.name.endsWith('.bmp') ||
          a.name.endsWith('.tiff') ||
          a.name.endsWith('.tif') ||
          a.name.endsWith('.gif') ||
          a.name.endsWith('.pbm') ||
          a.name.endsWith('.pgm') ||
          a.name.endsWith('.ppm')
        ) {
          const result = await Tesseract.recognize(a.url, 'eng');
          const extractedText = result.data.text;

          const bestMatch = Cache.getErrors()
            .filter((x) => x.level === Level.PIMG)
            .map((emsg) => ({
              id: emsg.id,
              match: fuzzy(extractedText.toLowerCase(), emsg.pattern?.toLowerCase()!),
              solution: emsg.solution!,
            }))
            .filter((x) => x.match > 0.85)
            .reduce((best, current) => (current.match > best.match ? current : best), { id: 0, match: 0, solution: '' });

          if (bestMatch.match > 0) {
            await msg.reply({
              embeds: [
                EmbedCreator.Support(
                  `__LSPDFR AutoHelper__\n-# Image Matched with ID: ${bestMatch.id} - ${(bestMatch.match * 100).toFixed(2)}%\n\n>>> ${bestMatch.solution}`
                ),
              ],
            });
          }
        }
      }
    }
  }
}
