import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types/index";
import { useQueue } from "discord-player";

const skipCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Melewati lagu yang sedang diputar"),
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = useQueue(interaction.guildId!);
    if (!queue || !queue.isPlaying()) {
      await interaction.reply({
        content: "❌ Tidak ada lagu yang sedang diputar!",
        ephemeral: true,
      });
      return;
    }

    queue.node.skip();
    await interaction.reply("⏭️ Lagu dilewati!");
  },
};

export default skipCommand;
