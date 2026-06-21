import { register } from "discord-hono";
import { cmds } from "./commands";

register(
	cmds.map((v) => v[1](v[0])),
	process.env.DISCORD_APPLICATION_ID,
	process.env.DISCORD_BOT_TOKEN
);
