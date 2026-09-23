import { register } from "discord-hono";
import * as fetchuser from "./commands/fetchuser";

register(
	[fetchuser.command],
	process.env.DISCORD_APPLICATION_ID,
	process.env.DISCORD_BOT_TOKEN
);
