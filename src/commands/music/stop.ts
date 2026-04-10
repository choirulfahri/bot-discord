import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types/index";
import { useQueue } from "discord-player";

const stopCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Menghentikan lagu dan mengeluarkan bot"),
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = useQueue(interaction.guildId!);
    if (!queue) {
      await interaction.reply({
        content: "‚ùå Tidak ada antrean yang aktif saat ini!",
        ephemeral: true,
      });
      return;
    }

    queue.delete();
    await interaction.reply("Ìªë Berhasil menghentikan siaran!");
  },
};

export default stopCommand;
