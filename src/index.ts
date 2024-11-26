import 'dotenv/config';
import { Client } from 'discord.js';

const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
});

client.on('ready', (c) => {
  console.log(`Bot loaded as ${c.user.tag}`);
});

client.login(process.env.TOKEN);
