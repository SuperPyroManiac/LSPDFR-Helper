import { addMinutes } from 'date-fns';
import { ButtonInteraction, ContextMenuCommandInteraction, Message, StringSelectMenuInteraction } from 'discord.js';
import { Logger } from '../../Functions/Messages/Logger';
import { ProcessorType } from '../../Cache';

export class ProcessCache<T extends ProcessorType> {
  public Expire = addMinutes(new Date(), 5);
  public OriginalMessage!: Message;
  public Interaction: ContextMenuCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;
  public Processor?: T;

  public constructor(originalMessage: Message, interaction: ContextMenuCommandInteraction | ButtonInteraction | StringSelectMenuInteraction, processor?: T) {
    this.Interaction = interaction;
    this.OriginalMessage = originalMessage;
    this.Processor = processor;
  }

  public async Update(newCache: ProcessCache<T>): Promise<ProcessCache<T>> {
    if ((this.OriginalMessage ?? newCache.OriginalMessage) != undefined && this.OriginalMessage.id != newCache.OriginalMessage.id) {
      await Logger.ErrLog(`Attempted to update process cache that belongs to a different message!\r\n${this}`);
      return this;
    }

    this.OriginalMessage = newCache.OriginalMessage ?? this.OriginalMessage;
    this.Processor = newCache.Processor ?? this.Processor;
    this.Expire = addMinutes(new Date(), 5);
    return this;
  }

  public static IsCacheAvailable(cache: ProcessCache<ProcessorType> | undefined): boolean {
    if (!cache || !cache.Processor || !cache.Processor.log || !cache.OriginalMessage) return false;
    return true;
  }

  public async Cleanup() {
    await this.Interaction.deleteReply().catch(() => {});
  }
}
