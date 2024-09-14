import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

config({
    path: path.join(__dirname, "../.env"),
});

const envSchema = z.object({
    /**
     * The discord app token
     */
    TOKEN: z.string(),

    /**
     * The client id
     */
    CLIENT_ID: z.string(),

    /**
     * The default language
     */
    DEFAULT_LANGUAGE: z.string().default("EnglishUS"),

    /**
     * The bot prefix
     */
    PREFIX: z.string().default("!"),

    /**
     * The owner ids
     */
    OWNER_IDS: z.string().array().optional(),

    /**
     * The guild id for devlopment purposes
     */
    GUILD_ID: z.string().optional(),

    /**
     * The Top.gg api key
     */
    TOPGG: z.string().optional(),

    /**
     * The keep alive boolean
     */
    KEEP_ALIVE: z.boolean().default(false),

    /**
     * The log channel id
     */
    LOG_CHANNEL_ID: z.string().optional(),

    /**
     * The log command id
     */
    LOG_COMMANDS_ID: z.string().optional(),

    /**
     * The bot status
     */
    BOT_STATUS: z.string().default("online"),

    /**
     * The bot activity
     */
    BOT_ACTIVITY: z.string().default("Lavamusic"),

    /**
     * The bot activity type
     */
    BOT_ACTIVITY_TYPE: z.number().default(0),
    /**
     * The database url
     */
    DATABASE_URL: z.string().optional(),

    /**
     * Search engine
     */
    SEARCH_ENGINE: z.enum(["youtube", "youtubemusic", "soundcloud", "spotify", "apple", "deezer", "yandex", "jiosaavn"]).default("youtube"),

    /**
     * Node in json
     */
    NODES: z.string(),
});

type Env = z.infer<typeof envSchema>;

/**
 * The environment variables
 */
export const env: Env = envSchema.parse(process.env);

for (const key in env) {
    if (!(key in env)) {
        throw new Error(`Missing env variable: ${key}`);
    }
}
