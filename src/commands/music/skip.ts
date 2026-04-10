import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../types";

const skipCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Melewati lagu yang sedang diputar"),
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

    player.skip();
    
    await interaction.reply("Lagu berhasil di-skip!");
  },
};

export default skipCommand;
