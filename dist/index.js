"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const framework_1 = require("@sapphire/framework");
const client = new framework_1.SapphireClient({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
client.login(process.env.TOKEN);
