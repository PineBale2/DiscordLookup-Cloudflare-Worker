import { DiscordHono } from "discord-hono";
import * as fetchuser from "./commands/fetchuser";

const app = new DiscordHono({
	discordEnv: {
		APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
		TOKEN: process.env.DISCORD_BOT_TOKEN,
		PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY
	}
});

app.autocomplete(fetchuser.label, fetchuser.autocompleter, fetchuser.handler);

export default app;
