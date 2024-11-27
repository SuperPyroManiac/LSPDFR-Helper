"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const framework_1 = require("@sapphire/framework");
const client = new framework_1.SapphireClient({
    intents: [
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
    ],
    presence: {
        status: 'dnd',
        activities: [{ name: 'with fire!', type: discord_js_1.ActivityType.Playing }],
    },
    loadMessageCommandListeners: true,
});
client.login(process.env.TOKEN);
