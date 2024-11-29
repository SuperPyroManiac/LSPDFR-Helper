import 'dotenv/config';
import { ActivityType, GatewayIntentBits } from 'discord.js';
import { SapphireClient } from '@sapphire/framework';

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  presence: {
    status: 'dnd',
    activities: [{ name: 'with fire!', type: ActivityType.Playing }],
  },
  loadMessageCommandListeners: true,
});

client.login(process.env.TOKEN); //Test
