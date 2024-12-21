import { config } from 'dotenv';
import '@sapphire/plugin-logger/register';
import { ActivityType, GatewayIntentBits, ShardingManager } from 'discord.js';
import { SapphireClient } from '@sapphire/framework';
import { Startup } from './Functions/Startup';
import { ShardUtils } from './Functions/ShardUtils';
config({ path: '../.env' });

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ],
  presence: {
    status: 'dnd',
    activities: [{ name: 'with fire!', type: ActivityType.Playing }],
  },
  loadMessageCommandListeners: true,
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.once('ready', async () => {
  if (client.shard?.ids[0] === 0) {
    await Startup.ManagerInit();
  } else {
    await Startup.Init();
  }
  if (client.shard?.ids[0] === 3) await Startup.ready();
});

void client.login(process.env['TOKEN']);
