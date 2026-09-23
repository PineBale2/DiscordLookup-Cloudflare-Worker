import {
	$users$_,
	Autocomplete,
	AutocompleteHandler,
	Command,
	CommandHandler,
	Option
} from "discord-hono";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	MessageFlags
} from "discord-api-types/v10";

export const label = "fetchuser";
export const option_userid = "userid";

export const command = new Command(
	label,
	"Fetch user public info by Discord snowflake ID."
)
	.options(
		new Option(option_userid, "Discord user snowflake ID")
			.required(true)
			.autocomplete(true)
	)
	.type(ApplicationCommandType.ChatInput)
	.contexts(InteractionContextType.BotDM)
	.integration_types(ApplicationIntegrationType.UserInstall);

export const handler: CommandHandler<any> = (c) => {
	const id = c.var[option_userid];
	return c.resDefer(async (ctx) => {
		const res = await ctx.rest("GET", $users$_, [id]);
		if (!res.ok) {
			const resText = await res.text();
			console.error(`API error ${res.status}: ${resText}`);
			if (res.status === 404) {
				return ctx.followup({
					content: "Not found.",
					flags: MessageFlags.Ephemeral
				});
			}
			return ctx.followup({
				content: `API error ${res.status}`,
				flags: MessageFlags.Ephemeral
			});
		}
		const resBody = await res.json();

		const usrType = resBody.bot === true ? "Bot" : "User";
		const creationTimeUnix = (BigInt(resBody.id) >> 22n) + 1420070400000n;
		const creationTime = Math.floor(
			new Date(Number(creationTimeUnix)).getTime() / 1000
		);
		let usrn = resBody.username;
		if (resBody.discriminator !== "0") {
			usrn += `#${resBody.discriminator}`;
		}

		let rep = `
${usrType} info of ${resBody.username}:

ID: ${resBody.id}
Creation time: <t:${creationTime}:R> (${creationTimeUnix})
Username: ${usrn}
`;
		if (resBody.global_name) {
			rep += `Display name: ${resBody.global_name}\n`;
		}
		rep += `${resBody.avatar ? `Avatar hash: ${resBody.avatar}` : `This ${usrType.toLowerCase()} does not have a custom avatar.`}\n`;
		let blob: Blob | undefined = undefined;
		if (resBody.avatar) {
			blob = await fetch(
				`https://cdn.discordapp.com/avatars/${resBody.id}/${resBody.avatar}.webp?size=4096${resBody.avatar.startsWith("a_") ? "&animated=true" : ""}`,
				{ signal: AbortSignal.timeout(5000) }
			)
				.then((r) => r.blob())
				.catch((e) => {
					console.error(e);
					return undefined;
				});
		}
		if (resBody.primary_guild) {
			if (resBody.primary_guild.identity_guild_id) {
				rep += `Primary guild ID: ${resBody.primary_guild.identity_guild_id}`;
				if (resBody.primary_guild.identity_enabled === true) {
					rep += ` [(${resBody.primary_guild.tag})](https://cdn.discordapp.com/guild-tag-badges/${resBody.primary_guild.identity_guild_id}/${resBody.primary_guild.badge}.webp?size=16)`;
				}
				rep += "\n";
			}
		}
		if (blob) {
			return ctx.followup(rep, { blob, name: "image.webp" });
		}
		return ctx.followup(rep);
	});
};

export const autocompleter: AutocompleteHandler<any> = (ctx) => {
	const uin = ctx.focused?.value.toString() || "";
	return ctx.resAutocomplete(
		new Autocomplete(uin).choices(
			...process.env.DISCORD_PRESETS.split(";")
				.map((v) => {
					const o = v.split(":");
					const name = o[0];
					const value = o[1];
					return {
						name: name,
						value: value
					};
				})
				.filter(
					(item) =>
						item.name.startsWith(uin) || item.value.startsWith(uin)
				)
				.slice(0, 25)
		)
	);
};
