import Database from 'better-sqlite3';
import ANNClient from '../structures/ANNClient.js';
import AnisongClient, { AnisongData } from '../structures/AnisongClient.js';
import AnilistClient from '../structures/AnilistClient.js';

import config from '../config.js';
import { CronJob } from 'cron';

const db = new Database('./database/game.db', {
    fileMustExist: false,
    readonly: false,
});
db.pragma('journal_mode=WAL');
export default class GameData {

    constructor() { }
    public async intialize(): Promise<void> {
        db.prepare(
            'CREATE TABLE IF NOT EXISTS gameplayers (discordId INTEGER, gameId TEXT, score INTEGER, PRIMARY KEY (discordId, gameId))'
        ).run();
        db.prepare(
            'CREATE TABLE IF NOT EXISTS  games (id TEXT PRIMARY KEY, )'
        ).run();
        db.prepare(
            'CREATE TABLE IF NOT EXISTS  amqgames (gameId TEXT PRIMARY KEY)'
        ).run();
        db.prepare(
            'CREATE TABLE IF NOT EXISTS  amqsettings (gameId TEXT PRIMARY KEY)'
        ).run();
    }
}