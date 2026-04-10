import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../types";

const volumeCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Mengatur volume musik")
    .addIntegerOption((option) =>
      option.setName("level").setDescription("Tingkat volume (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const level = interaction.options.getInteger("level", true);
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

    player.setVolume(level);
    
    await interaction.reply(`Volume berhasil diatur menjadi **${level}%**!`);
  },
};

export default volumeCommand;
