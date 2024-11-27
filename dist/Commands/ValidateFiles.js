"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommand = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
class SlashCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Delete message and ban author.',
        });
    }
    registerApplicationCommands(registry) {
        registry.registerContextMenuCommand((builder) => builder //
            .setName('Validate Files')
            .setType(discord_js_1.ApplicationCommandType.Message));
    }
    contextMenuRun(interaction) {
        return interaction.reply(`Interaction works, ran by ${interaction.user.tag}`);
    }
}
exports.SlashCommand = SlashCommand;
