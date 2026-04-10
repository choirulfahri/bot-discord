import { Client, TextChannel } from "discord.js";

export = (client: Client, sendErrorToDev: Function) => {
  client.distube
    .on("playSong" as any, (queue: any, song: any) => {
      if (queue.textChannel) {
        (queue.textChannel as TextChannel).send(
          `Aku lagi Putar lagu: \`${song.name}\` - \`${song.formattedDuration}\`\nRequestnya kakak: ${song.user}`,
        );
      }
    })
    .on("addSong" as any, (queue: any, song: any) => {
      if (queue.textChannel) {
        (queue.textChannel as TextChannel).send(
          `Lagunya udah aku tambahin ke antrian: \`${song.name}\` - \`${song.formattedDuration}\``,
        );
      }
    })
    .on("error" as any, (channel: any, error: any) => {
      // Perbaikan: Terkadang DisTube mengirimkan error di parameter pertama, bukan objek channel
      const isErrorOnly = channel instanceof Error || channel.message;
      const actualError = isErrorOnly ? channel : error;
      const hasChannel =
        channel && channel.send && typeof channel.send === "function";

      // Kirim error teknis ke DM atau log console dengan informasi objek error yang benar
      sendErrorToDev(actualError, "Music System (DisTube)");

      if (hasChannel) {
        // Pesan Publik yang Ramah Pengguna (Hanya teks biasa)
        (channel as TextChannel)
          .send(
            `Sebentar kak ada masalah teknis \nMaaf kak, proses lagu terhenti sesaat. Jangan khawatir, kak developer sudah menerima laporan error ini dan akan segera memperbaikinya!`,
          )
          .catch(() => {}); // catch tambahan jika send gagal
      }
    });
};
