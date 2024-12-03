import { EmbedBuilder } from 'discord.js';
import { ProcessCache } from '../../../CustomTypes/CacheTypes/ProcessCache';
import { ProcessorType } from '../../../Cache';

export class BaseProcessor {
  AddExtraInfo(embed: EmbedBuilder, cache: ProcessCache<ProcessorType>): EmbedBuilder {
    return embed.addFields(
      { name: 'Uploader:', value: `<@${cache.OriginalMessage.author.id}>`, inline: true },
      { name: 'Message:', value: `${cache.OriginalMessage.url}`, inline: true },
      { name: 'Duration:', value: `${cache.Processor?.log.elapsedTime} MS`, inline: true }
    );
  }

  RemoveExtraInfo(embed: EmbedBuilder): EmbedBuilder {
    return embed.spliceFields(0, 3);
  }
}
