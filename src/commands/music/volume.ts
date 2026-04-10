import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types/index";
import { useQueue } from "discord-player";

const volumeCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Mengubah tingkat suara bot")
    .addIntegerOption((option) =>
      option.setName("level").setDescription("Dari 1 sampai 100").setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const volume = interaction.options.getInteger("level", true);
    const queue = useQueue(interaction.guildId!);

    if (!queue || !queue.isPlaying()) {
      await interaction.reply({
        content: "‚ùå Tidak ada lagu yang diputar!",
        ephemeral: true,
      });
      return;
    }

    if (volume < 1 || volume > 100) {
      await interaction.reply({
        content: "‚ö† Level volume harus antara 1 sampai 100!",
        ephemeral: true,
      });
      return;
    }

    queue.node.setVolume(volume);
    await interaction.reply(`Ì¥ä Volume diubah menjadi **${volume}%**!`);
  },
};

export default volumeCommand;
