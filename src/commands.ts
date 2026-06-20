import {
	$users$_,
	Autocomplete,
	AutocompleteHandler,
	Command,
	CommandHandler,
	Option,
	register
} from "discord-hono";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType
} from "discord-api-types/v10";
import * as constants from "./constants";

/**
 * 1. Label
 * 2. Instance for registration
 * 3. Command handler
 * 4. Autocompleter (optional)
 */
export const cmds: [
	string,
	(n: string) => Command<any>,
	CommandHandler<any>,
	AutocompleteHandler<any>?
][] = [
	[
		constants.cmd_name_fetchuser,
		(n) =>
			new Command(n, "Fetch user public info by Discord snowflake ID.")
				.options(
					new Option(
						constants.cmd_name_fetchuser_option_userid,
						"Discord user snowflake ID"
					)
						.required(true)
						.autocomplete(true)
				)
				.type(ApplicationCommandType.ChatInput)
				.contexts(InteractionContextType.BotDM)
				.integration_types(ApplicationIntegrationType.UserInstall),
		(c) => {
			const id = c.var[constants.cmd_name_fetchuser_option_userid];
			return c.resDefer(async (ctx) => {
				const res = await ctx.rest("GET", $users$_, [id]);
				if (!res.ok) {
					ctx.flags("EPHEMERAL");
					return ctx.followup(`API error ${res.status}: ${res.text}`);
				}
				const resBody = await res.json();

				const usrType = resBody.bot === true ? "Bot" : "User";
				const creationTimeUnix =
					(Number(resBody.id) >> 22) + 1420070400000;
				let usrn = resBody.username;
				if (resBody.discriminator !== "0") {
					usrn += `#${resBody.discriminator}`;
				}

				let rep = `
${usrType} info of ${resBody.username}:

ID: ${resBody.id}
Creation time: <t:${creationTimeUnix}:F> (${creationTimeUnix})
Username: ${usrn}
`;
				if (resBody.global_name) {
					rep += `Display name: ${resBody.global_name}\n`;
				}
				rep += `${resBody.avatar ? `[Avatar hash: ${resBody.avatar}](https://cdn.discordapp.com/avatars/${resBody.id}/${resBody.avatar}.webp?size=4096)` : "This user does not have a custom avatar."}\n`;
				return ctx.followup(rep);
			});
		},
		(ctx) => {
			const uin = ctx.focused?.value.toString() || "";
			return ctx.resAutocomplete(new Autocomplete(uin).choices());
		}
	]
];

register(
	cmds.map((v) => v[1](v[0])),
	process.env.DISCORD_APPLICATION_ID,
	process.env.DISCORD_BOT_TOKEN
);
