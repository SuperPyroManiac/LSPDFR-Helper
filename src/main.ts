import 'dotenv/config';
import '@sapphire/plugin-logger/register';
import { ActivityType, GatewayIntentBits } from 'discord.js';
import { SapphireClient } from '@sapphire/framework';
import { Startup } from './Functions/Startup';

const client = new SapphireClient({
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  presence: {
    status: 'dnd',
    activities: [{ name: 'with fire!', type: ActivityType.Playing }],
  },
  loadMessageCommandListeners: true,
});

client.once('ready', async () => await Startup.Init());

client.login(process.env.TOKEN);
