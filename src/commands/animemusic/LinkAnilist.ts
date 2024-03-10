import { Command, Context, Lavamusic } from '../../structures/index.js';

export default class PlayAnilist extends Command {
    constructor(client: Lavamusic) {
        super(client, {
            name: 'linkanilist',
            description: {
                content: 'Links an anilist to your user.',
                examples: [
                    'linkanilist Incendy'
                ],
                usage: 'linkanilist <anilist name>',
            },
            category: 'general',
            aliases: ['la'],
            cooldown: 3,
            args: true,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: ['SendMessages', 'ViewChannel', 'EmbedLinks'],
                user: [],
            },
            slashCommand: true,
            options: [
                {
                    name: 'anilistname',
                    description: 'The anilist you want to link.',
                    type: 3,
                    required: true
                },
            ],
        });
    }
    public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
        let result = await client.animedb.setUserAnilist(parseInt(ctx.author.id), args[0]);
        let embed = client.embed();
        if (result) {
            ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.main)
                        .setDescription(
                            `Successfully updated you anilist to: ${args[0]}`
                        ),
                ],
            });
        } else {
            ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription('User either does not exist or has no anime data.'),
                ],
            });
        }
        return;
    }
}