import 'dotenv/config';
import { Client } from 'discord.js';
import { handleMsgSent } from './Events/MessageSent';

const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
});

client.on('ready', (c) => {
  console.log(`Bot loaded as ${c.user.tag}`);
});

client.on('messageCreate', (message) => handleMsgSent(message));

client.login(process.env.TOKEN);
