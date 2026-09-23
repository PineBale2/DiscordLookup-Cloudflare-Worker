import { DiscordHono } from "discord-hono";
import { cmds } from "./commands";

let app = new DiscordHono();
cmds.forEach((cmd) => {
	if (cmd.length == 4 && cmd[3]) {
		app = app.autocomplete(cmd[0], cmd[3], cmd[2]);
	} else {
		app = app.command(cmd[0], cmd[2]);
	}
});

export default app;
