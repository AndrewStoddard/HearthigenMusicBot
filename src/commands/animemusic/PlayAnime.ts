import { LoadType } from 'shoukaku';
import { AnisongQuery } from '../../database/anime.js';
import { Command, Context, Lavamusic } from '../../structures/index.js';

export default class Play extends Command {
    constructor(client: Lavamusic) {
        super(client, {
            name: 'playanime',
            description: {
                content: 'Plays a song from AMQ Database',
                examples: [ ],
                usage: 'playanime',
            },
            category: 'animemusic',
            aliases: ['pa'],
            cooldown: 3,
            args: true,
            player: {
                voice: true,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: ['SendMessages', 'ViewChannel', 'EmbedLinks', 'Connect', 'Speak'],
                user: [],
            },
            slashCommand: true,
            options: [
                {
                    name: 'numberofsongs',
                    description: 'The max number of songs to add to queue',
                    type: 4,
                    required: true,
                    maxValue: 150,
                    minValue: 1
                },
                {
                    name: 'animename',
                    description: 'The anime from song',
                    type: 3,
                    required: false,
                    autocomplete: true
                },
                {
                    name: 'songname',
                    description: 'The name of the anime song',
                    type: 3,
                    required: false,
                    autocomplete: true
                },
                {
                    name: 'user',
                    description: 'The discord user whose list you want to choose from',
                    type: 6,
                    required: false,
                },
                {
                    name: 'artist',
                    description: 'The artist who sang the song',
                    type: 3,
                    required: false,
                    autocomplete: true
                },
                {
                    name: 'completed',
                    description: 'Anime where the user is completed.',
                    type: 5,
                    required: false,
                },
                {
                    name: 'watching',
                    description: 'Anime where the user is watching.',
                    type: 5,
                    required: false,
                },
                {
                    name: 'paused',
                    description: 'Anime where the user is paused.',
                    type: 5,
                    required: false,
                },
                {
                    name: 'maxscore',
                    description: 'The maximum user score from the User requested. ',
                    type: 10,
                    required: false,
                },
                {
                    name: 'minscore',
                    description: 'The minimum user score from the User requested. ',
                    type: 10,
                    required: false,
                },
                {
                    name: 'anilistname',
                    description: 'The anime of the anilist user.',
                    type: 3,
                    required: false,
                    autocomplete: true
                },
                {
                    name: 'openings',
                    description: 'Are the songs openings?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'inserts',
                    description: 'Are the songs inserts?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'endings',
                    description: 'Are the songs endings?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'movie',
                    description: 'Is the anime a movie?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'tv',
                    description: 'Is the anime a TV?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'ona',
                    description: 'Is the anime an ONA?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'ova',
                    description: 'Is the anime an OVA?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'special',
                    description: 'Is the anime a special?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'maxdifficulty',
                    description: 'The highest difficulty of the songs',
                    type: 10,
                    required: false,
                    maxValue: 100, 
                    minValue: 0
                },
                {
                    name: 'mindifficulty',
                    description: 'The lowest difficulty of the songs',
                    type: 10,
                    required: false,
                    maxValue: 100,
                    minValue: 0
                },
                {
                    name: 'instumental',
                    description: 'Are the songs instrumental?   ',
                    type: 5,
                    required: false,
                },
                {
                    name: 'character',
                    description: 'Are the characters singing the songs?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'chanting',
                    description: 'Are the songs chanting?',
                    type: 5,
                    required: false,
                },
                {
                    name: 'standard',
                    description: 'Are the songs standard?',
                    type: 5,
                    required: false,
                }
            ],
        });
    }
    public async run(client: Lavamusic, ctx: Context, args: string[]): Promise<any> {
        let anisongQuery = new AnisongQuery();
        anisongQuery.numberOfSongs = parseInt(args[0]);
        let option;
        if (option = ctx.interaction.options.get('animename')) {
            anisongQuery.animeName = option.value;
            anisongQuery.annSort = true;
        }
        if (option = ctx.interaction.options.get('songname')) {
            anisongQuery.songName = option.value;
        }
        if (option = ctx.interaction.options.get('user')) {
            anisongQuery.discordId = parseInt(option.value);
        }
        if (option = ctx.interaction.options.get('artist')) {
            anisongQuery.artist = option.value;
        }
        if (option = ctx.interaction.options.get('completed')) {
            anisongQuery.userStatusCompleted = option.value;
        }
        if (option = ctx.interaction.options.get('watching')) {
            anisongQuery.userStatusWatching = option.value;
        }
        if (option = ctx.interaction.options.get('paused')) {
            anisongQuery.userStatusPaused = option.value;
        }
        if (option = ctx.interaction.options.get('maxscore')) {
            anisongQuery.userScoreMax = option.value;
        }
        if (option = ctx.interaction.options.get('minscore')) {
            anisongQuery.userScoreMin = option.value;
        }
        if (option = ctx.interaction.options.get('anilistname')) {
            anisongQuery.anilistName = option.value;
        }
        if (option = ctx.interaction.options.get('openings')) {
            anisongQuery.openings = option.value;
        }
        if (option = ctx.interaction.options.get('endings')) {
            anisongQuery.endings = option.value;
        }
        if (option = ctx.interaction.options.get('inserts')) {
            anisongQuery.inserts = option.value;
        }
        if (option = ctx.interaction.options.get('movies')) {
            anisongQuery.movie = option.value;
        }
        if (option = ctx.interaction.options.get('ova')) {
            anisongQuery.ova = option.value;
        }
        if (option = ctx.interaction.options.get('ona')) {
            anisongQuery.ona = option.value;
        }
        if (option = ctx.interaction.options.get('special')) {
            anisongQuery.special = option.value;
        }
        if (option = ctx.interaction.options.get('tv')) {
            anisongQuery.tv = option.value;
        }
        if (option = ctx.interaction.options.get('maxdifficulty')) {
            anisongQuery.difficultyMax = option.value;
        }
        if (option = ctx.interaction.options.get('mindifficulty')) {
            anisongQuery.difficultyMin = option.value;
        }
        if (option = ctx.interaction.options.get('instrumental')) {
            anisongQuery.instrumental = option.value;
        }
        if (option = ctx.interaction.options.get('character')) {
            anisongQuery.character = option.value;
        }
        if (option = ctx.interaction.options.get('chanting')) {
            anisongQuery.chanting = option.value;
        }
        if (option = ctx.interaction.options.get('standard')) {
            anisongQuery.standard = option.value;
        }
        let queryResult = client.animedb.queryAnisongs(anisongQuery);
        let songs = [];
        let player = client.queue.get(ctx.guild.id);
        const vc = ctx.member as any;
        if (!player) player = await client.queue.create(ctx.guild, vc.voice.channel, ctx.channel);
        const embed = this.client.embed();
        if (queryResult.length == 0) {
            ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription('There were no results found.'),
                ],
            });
        } else {
            ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.main)
                        .setDescription(
                            `Adding ${queryResult.length} songs to the queue.`
                        ),
                ],
            });
        }
        queryResult.forEach(async element => {
            let lavaLinkResponse = await client.queue.search(element.audioURL);
            switch (lavaLinkResponse.loadType) {
                case LoadType.ERROR:
                    ctx.sendMessage({
                        embeds: [
                            embed
                                .setColor(this.client.color.red)
                                .setDescription('There was an error while searching.'),
                        ],
                    });
                    break;
                case LoadType.EMPTY:
                    ctx.sendMessage({
                        embeds: [
                            embed
                                .setColor(this.client.color.red)
                                .setDescription('There were no results found.'),
                        ],
                    });
                    break;
                case LoadType.TRACK: {
                    const track = player.buildTrack(lavaLinkResponse.data, ctx.author);
                    track.anisongQueryResult = element;
                    if (player.queue.length > client.config.maxQueueSize) {
                        return await ctx.sendMessage({
                            embeds: [
                                embed
                                    .setColor(this.client.color.red)
                                    .setDescription(
                                        `The queue is too long. The maximum length is ${client.config.maxQueueSize} songs.`
                                    ),
                            ],
                        });
                    }
                    player.queue.push(track);
                    await player.isPlaying();
                    break;
                }
                default: 
                    break;
            }
        });
    }
}
