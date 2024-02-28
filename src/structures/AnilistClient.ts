import Anilist, { AnimeEntry, MangaEntry, MediaSearchEntry } from "anilist-node";

import config from '../config.js';

export default class AnilistClient {
    private AnilistClient: Anilist;
    private RequestQueue: any[] = [];
    constructor() {
        this.RequestQueue = [];
        this.AnilistClient = new Anilist();  
        setInterval(() => {
            this.handleQueueRequest()
        }, 3000)
    }
    public QueueRequest(requestType: string, requestParams: any, callback: any): void {
        this.RequestQueue.push({
            "type": requestType,
            "params": requestParams,
            "callback": callback
        });
    }
    private async handleQueueRequest() {
        if (this.RequestQueue == undefined || this.RequestQueue.length == 0) {
            return;
        }
        console.log("Current Length of Anilist Queue: " + this.RequestQueue.length);
        let nextRequest = this.RequestQueue.splice(0, 1)[0];
        if (nextRequest == undefined || nextRequest.type == undefined) {
            console.log("Failed to get request data");
            return;
        }
        let result:any;
        switch(nextRequest.type) {
            case ("SearchByAnimeName"):
                result = await this.SearchByAnimeName(nextRequest.params.animeName, nextRequest.params.id);
                break;
            case("SearchByMangaName"):
                result = await this.SearchByMangaName(nextRequest.params.mangaName, nextRequest.params.id);
                break;
            case("GetAnimeById"):
                result = await this.GetAnimeById(nextRequest.params.id);
                break;
            case("GetMangaById"):
                result = await this.GetMangaById(nextRequest.params.id);
                break;
            default:
                console.error("No request of type: " + nextRequest.type);
                return;
        }
        if (result == -1) {
            nextRequest.params.retrycount = nextRequest.params.retrycount != undefined ? nextRequest.params.retrycount + 1 : 1
            console.log("Failure Retry Count: " + nextRequest.params.retrycount);
            if ( nextRequest.params.retrycount <= 3) {
                this.RequestQueue.push(nextRequest);
            } else {
                console.log("Dropping request after 3 tries.")
                console.log(nextRequest);
            }
        } else {
            nextRequest.callback(result, nextRequest.params)
        }
    }
    private async SearchByAnimeName(animeName: string, id: number): Promise<number> {
        let result: MediaSearchEntry;
        try {
            result = await this.AnilistClient.searchEntry.anime(animeName.toString(), {}, 1, 1);
        } catch (error) {
            if (error.message.includes("AniList API returned with a 429 error code. Message: Too Many Requests")) {
                console.error("RATE LIMIT HIT");
                return -1;
            } else {
                console.error('ANIME SEARCH ERROR'),
                console.error(id);
                console.error(animeName);
                console.error(error);
                return -1;
            }
        }
        let anilistId = 0;
        if (result != undefined && result.media.length > 0) {
            anilistId = result.media[0].id;
        }
        return anilistId;
    }
    private async SearchByMangaName(mangaName: string, id: number): Promise<number> {
        let result: MediaSearchEntry;
        try {
            result = await this.AnilistClient.searchEntry.manga(mangaName.toString(), {}, 1, 1);
        } catch (error) {
            if (error.message.includes("AniList API returned with a 429 error code. Message: Too Many Requests")) {
                console.error("RATE LIMIT HIT");
                return -1;
            } else {
                console.error('MANGA SEARCH ERROR'),
                console.error(id);
                console.error(mangaName);
                console.error(error);
                return -1;
            }
        }
        let anilistId = 0;
        if (result != undefined && result.media.length > 0) {
            anilistId = result.media[0].id;
        }
        return anilistId;
    }
    public async GetAnimeById(id: number): Promise<any> {
        let result: AnimeEntry;
        try {
            result = await this.AnilistClient.media.anime(id);
        } catch (error) {
            if (error.message.includes("AniList API returned with a 429 error code. Message: Too Many Requests")) {
                console.error("RATE LIMIT HIT");
                return -1;
            } else {
                console.error('ANIME GET ERROR'),
                console.error(id);
                console.error(error);
                return -1;
            }
        }
        return result;
    }
    public async GetMangaById(id: number): Promise<any> {
        let result: MangaEntry;
        try {
            result = await this.AnilistClient.media.manga(id);
        } catch (error) {
            if (error.message.includes("AniList API returned with a 429 error code. Message: Too Many Requests")) {
                console.error("RATE LIMIT HIT");
                return -1;
            } else {
                console.error('MANGA GET ERROR'),
                console.error(id);
                console.error(error);
                return -1;
            }
        }
        return result;
    }
}