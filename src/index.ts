import { DiscordHono } from "discord-hono";
import { cmds } from "./commands";

let app = new DiscordHono({
	discordEnv: {
		APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
		TOKEN: process.env.DISCORD_BOT_TOKEN,
		PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY
	}
});
cmds.forEach((cmd) => {
	if (cmd.length == 4 && cmd[3]) {
		app = app.autocomplete(cmd[0], cmd[3], cmd[2]);
	} else {
		app = app.command(cmd[0], cmd[2]);
	}
});

export default app;
