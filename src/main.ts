import { config } from 'dotenv';
config({ path: '../.env' });

import '@sapphire/plugin-logger/register';
import { ActivityType, GatewayIntentBits } from 'discord.js';
import { SapphireClient } from '@sapphire/framework';
import { Startup } from './Functions/Startup';

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
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

client.once('ready', async () => await Startup.Init());

client.login(process.env.TOKEN);
