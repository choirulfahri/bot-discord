import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../types";

const stopCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Berhenti memutar musik dan bot akan keluar dari voice"),
  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice?.channel;

    if (!voiceChannel) {
      await interaction.reply({ content: "Maaf, Kakak harus ada di dalam voice ya:)", ephemeral: true });
      return;
    }

    const player = interaction.client.manager.players.get(interaction.guildId as string);
    if (!player) {
      await interaction.reply({ content: "Tidak ada lagu yang sedang diputar.", ephemeral: true });
      return;
    }

    player.destroy();
    
    await interaction.reply("Berhasil berhenti dan keluar dari Voice Channel!");
  },
};

export default stopCommand;
