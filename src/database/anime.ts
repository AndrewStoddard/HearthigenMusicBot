import Database from 'better-sqlite3';
import ANNClient from '../structures/ANNClient.js';
import AnisongClient, { AnisongData } from '../structures/AnisongClient.js';
import AnilistClient from '../structures/AnilistClient.js';

import config from '../config.js';
import { CronJob } from 'cron';

const db = new Database('./database/anime.db', {
    fileMustExist: false,
    readonly: false,
});
db.pragma('journal_mode=WAL');
export default class AnimeData {
    private ANNClient: ANNClient
    private AnisongClient: AnisongClient
    private AnilistClient: AnilistClient
    constructor() {
        this.ANNClient = new ANNClient();
        this.AnisongClient = new AnisongClient();
        this.AnilistClient = new AnilistClient();
    }
    public async intialize(): Promise<void> {
        db.prepare(
            'CREATE TABLE IF NOT EXISTS ann (annId INTEGER PRIMARY KEY, gid INTEGER, type TEXT, name TEXT, precision TEXT, vintage TEXT, hasAnilist BOOLEAN NOT NULL CHECK (hasAnilist IN (0, 1)), hasAnisong BOOLEAN NOT NULL CHECK (hasAnisong IN (0, 1)))'
        ).run();
        db.prepare(
            'CREATE TABLE IF NOT EXISTS anilistmedia (anilistMediaId INTEGER, annId INTEGER, name TEXT, PRIMARY KEY (anilistMediaId, annId))'
        ).run();
        db.prepare(
            'CREATE TABLE IF NOT EXISTS anisong (anisongId INTEGER PRIMARY KEY, annId INTEGER, anilistMediaId INTEGER, url TEXT, songType TEXT, anisongType TEXT, animeEng TEXT, animeJap TEXT, songName TEXT, animeType TEXT)'
        ).run();
        const data: any = db.prepare('SELECT * FROM ann LIMIT 1').get();
        if (!data) {
            await this.pullAllFromANN();
        } else {
            this.doBasicDBOperations();
        }
        const job1 = new CronJob('0 0 0 * * *', this.pullRecentFromANN, null, true, 'America/New_York');
        const job2 = new CronJob('0 0 0 * * 1', this.CheckAnilistAndAnisongMissing, null, true, 'America/New_York');
        
    }
    private async doBasicDBOperations(): Promise<void> {
        await this.pullRecentFromANN();
        await this.CheckAnilistAndAnisongMissing();
        this.checkAnisongHasAnilist();
        this.checkAnisongMissingEnglish();
    }
    private async pullRecentFromANN(): Promise<void> {
        let maxAnnId: any = db.prepare(
            'SELECT MAX(annId) from ann'
        ).get();
        let latestANN = await this.ANNClient.getLatestANN()
        let diff = latestANN - maxAnnId;
        if (diff != 0) {
            setTimeout( async () => {
                let newANNs = await this.ANNClient.getNewANNs(diff);
                if (diff == 1 && !Array.isArray(newANNs)) {
                    this.addNewANN(newANNs);
                } else if (Array.isArray(newANNs)) {
                    newANNs.forEach(element => {
                        this.addNewANN(element);
                    });
                }
            } , 1500)
        }
    }
    private async pullAllFromANN(): Promise<void> {
        let allANNs = await this.ANNClient.getAllANNs();
        let promises: Promise<void>[] = [];
        allANNs.forEach(element => {
            promises.push(this.addNewANN(element));
        });
        Promise.all(promises)
    }
    public handleAnilistSearch(anilistId: number, returnParams: any) {
        if (anilistId != 0) {
            returnParams.this.addAnilistMediaToDB(anilistId, returnParams.id, returnParams.mangaName == undefined ? returnParams.animeName : returnParams.mangaName)
            returnParams.this.setAnilistTrueOnANN(returnParams.id);
            returnParams.this.setAnilistOnAnisong(anilistId, returnParams.id);
        }
    }
    public handleAnisongSearch(anisongs: AnisongData[], returnParams: any) {
        if (anisongs.length > 0) {
            let anilistId = returnParams.this.getAnilistIdFromANN(returnParams.annId);
            anisongs.forEach(anisong => {
                returnParams.this.addAnisongToDB(anisong.anisongId, anisong.annId, anilistId, anisong.url, anisong.songType, anisong.anisongType, anisong.animeEng, anisong.animeJap, anisong.songName, anisong.animeType);
            });
            if (anilistId == 0) {
                returnParams.this.AnilistClient.QueueRequest("SearchByAnimeName", {"id": returnParams.annId, "animeName": anisongs[0].animeJap, "this": returnParams.this}, returnParams.this.handleAnilistSearch);
            }
            returnParams.this.setAnisongTrueOnANN(returnParams.annId);
        }
    }
    public handleUpdateAnisongEnglish(anisongs: AnisongData[], returnParams: any) {
        if (anisongs.length > 0) {
            db.prepare('UPDATE anisong set animeEng = ? where annId = ?').run(anisongs[0].animeEng, returnParams.annId);
        }
    }
    private async CheckAnilistAndAnisongMissing(): Promise<void> {
        let noAnilistManga: any = db.prepare('SELECT * FROM ann WHERE hasAnilist = ? AND (type = ? OR type = ?)').all(0, 'manga', 'anthology');
        let noAnilistAnime: any = db.prepare('SELECT * FROM ann WHERE hasAnilist = ? AND type != ? AND type != ?').all(0, 'manga', 'anthology');
        let noAnisong: any = db.prepare('SELECT * FROM ann WHERE hasAnisong = ? AND type != ? AND type != ?').all(0, 'manga', 'anthology');
            if (noAnilistManga) { 
                noAnilistManga.forEach(async element => {
                    this.AnilistClient.QueueRequest("SearchByMangaName", {"id": element.annId, "mangaName": element.name, "this": this}, this.handleAnilistSearch);
                });
            }
            if (noAnilistAnime) { 
                noAnilistAnime.forEach(async element => {
                    this.AnilistClient.QueueRequest("SearchByAnimeName", {"id": element.annId, "animeName": element.name, "this": this}, this.handleAnilistSearch);
                });
            }
            if (noAnisong) { 
                noAnisong.forEach(async element => {
                    this.AnisongClient.QueueRequest("getAnisongDataFromANNId", {"annId": element.annId, "this": this}, this.handleAnisongSearch);
                });
            }
    }
    private checkAnisongMissingEnglish(): void {
        let anisongsWithoutEng: any = db.prepare('SELECT annId FROM anisong WHERE animeEng is NULL GROUP BY annId').all()
        if (anisongsWithoutEng) {
            anisongsWithoutEng.forEach(element => {
                this.AnisongClient.QueueRequest("getAnisongDataFromANNId", {"annId": element.annId, "this": this}, this.handleUpdateAnisongEnglish);
            });
        }
    }
    private checkAnisongHasAnilist(): void {
        let anisongsWithoutAnilist: any = db.prepare('SELECT * FROM anisong WHERE anilistMediaId = 0 ').all();
        if (anisongsWithoutAnilist) {
            anisongsWithoutAnilist.forEach(element => {
                let anilistmedia: any = db.prepare('SELECT * FROM anilistmedia where annId = ?').all(element.annId);
                if (anilistmedia && anilistmedia.length > 0) {
                    this.setAnilistOnAnisong(anilistmedia[0].anilistMediaId, element.annId);
                } else {
                    this.AnilistClient.QueueRequest("SearchByAnimeName", {"id": element.annId, "animeName": element.animeJap, "this": this}, this.handleAnilistSearch);
                }
            });
        }
    }
    private async addNewANN(ann: any): Promise<void> {
        let type = ann.type.toLowerCase();
        if (type.includes('manga') || type.includes('anthology')) {
            this.AnilistClient.QueueRequest("SearchByMangaName", {"id": ann.id, "mangaName": ann.name, "this": this}, this.handleAnilistSearch);
        } else if (type.includes('tv') || type.includes('oav') || type.includes('ona') || type.includes('ova') || type.includes('movie') || type.includes('special')) {
            this.AnilistClient.QueueRequest("SearchByAnimeName", {"id": ann.id, "animeName": ann.name, "this": this}, this.handleAnilistSearch);
            this.AnisongClient.QueueRequest("getAnisongDataFromANNId", {"annId": ann.id, "this": this}, this.handleAnisongSearch)
        } else {
            console.log("Type of '" + type + "' not found for annId '" + ann.id + "'. " + ann.name);
            return;
        }
        this.addAnnToDB(ann.id, ann.gid, ann.type.toLowerCase(), ann.name, ann.precision, false, false);
    }
    private addAnnToDB(annId: number, annGid: number, annType:string, annName:string, annPrecision:string, hasAnilist: boolean, hasAnisong: boolean): void {
        try {
            db.prepare('INSERT INTO ann (annId, gid, type, name, precision, hasAnilist, hasAnisong) VALUES(?, ?, ?, ?, ?, ?, ?)').run(annId, annGid, annType, annName, annPrecision, hasAnilist ? 1 : 0, hasAnisong ? 1 : 0);
        } catch (error) {
            console.error("FAILED INSERT ON anilistmedia TABLE");
            console.error(annId);
            console.error(annName);
            console.error(error);
        }
        
    }
    private addAnisongToDB(anisongId: number, annId: number, anilistMediaId: number, url: string, songType: string, anisongType: string, animeEng: string, animeJap: string, songName: string, animeType: string): void {
        console.log("Anisong Add To DB: " + anisongId);
        try {
            db.prepare('INSERT INTO anisong (anisongId, annId, anilistMediaId, url, songType, anisongType, animeEng, animeJap, songName, animeType) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(anisongId, annId, anilistMediaId, url, songType, anisongType, animeEng, animeJap, songName, animeType);
        } catch (error) {
            console.error("FAILED INSERT ON anilistmedia TABLE");
            console.error(annId);
            console.error(anisongId);
            console.error(error);
        }
        
    }
    private addAnilistMediaToDB(anilistId: number, annId: number, name: string): void {
        console.log("Anilist Add To DB: " + name);
        try {
            db.prepare('INSERT INTO anilistmedia (anilistMediaId, annId, name) VALUES(?, ?, ?)').run(anilistId, annId, name);
        } catch (error) {
            console.error("FAILED INSERT ON anilistmedia TABLE");
            console.error(anilistId);
            console.error(annId);
            console.error(name);
            console.error(error);
        }
        
    }
    private setAnilistTrueOnANN(annId: number): void {
        db.prepare('UPDATE ann SET hasAnilist = 1 WHERE annId = ?').run(annId)
    }
    private setAnisongTrueOnANN(annId: number): void {
        db.prepare('UPDATE ann SET hasAnisong = 1 WHERE annId = ?').run(annId)
    }
    private setAnilistOnAnisong(anilistId: number, annId: number): void {
        db.prepare('UPDATE anisong SET anilistMediaId = ? WHERE annId = ?').run(anilistId, annId)
    }
    private getAnilistIdFromANN(annId: number): number {
        let anilistId: any = db.prepare('SELECT anilistMediaId FROM anilistmedia WHERE annId = ? LIMIT 1').get(annId);
        if (!anilistId) {
            anilistId = 0;
        }
        return anilistId;
    }

  

}
