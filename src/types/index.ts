import { Collection, ChatInputCommandInteraction } from "discord.js";
import { Player } from "discord-player";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
    player: Player;
  }
}

export interface Command {
  data: any;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
