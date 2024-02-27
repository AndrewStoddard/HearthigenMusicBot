import Anilist, { MediaSearchEntry } from "anilist-node";

import config from '../config.js';

export default class AnilistClient {
    private AnilistClient: Anilist;
    private RequestQueue: any[] = [];
    constructor() {
        this.RequestQueue = [];
        this.AnilistClient = new Anilist();  
        setInterval(() => {
            this.handleQueueRequest()
        }, 1500)
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
        nextRequest.callback(result, nextRequest.params)
    }
    private async SearchByAnimeName(animeName: string, id: number): Promise<number> {
        let promise = new Promise(resolve => setTimeout(resolve, 1000));
        await promise;
        let result: MediaSearchEntry;
        try {
            result = await this.AnilistClient.searchEntry.anime(animeName.toString(), {}, 1, 1);
        } catch (error) {
            console.error('ANIME ERROR'),
            console.error(id);
            console.error(animeName);
            console.error(error);
        }
        let anilistId = 0;
        if (result != undefined && result.media.length > 0) {
            anilistId = result.media[0].id;
        }
        return anilistId;
    }
    private async SearchByMangaName(mangaName: string, id: number): Promise<number> {
        let promise = new Promise(resolve => setTimeout(resolve, 1000));
        await promise;
        let result: MediaSearchEntry;
        try {
            result = await this.AnilistClient.searchEntry.manga(mangaName.toString(), {}, 1, 1);
        } catch (error) {
            console.error('MANGA ERROR'),
            console.error(id);
            console.error(mangaName);
            console.error(error);
        }
        let anilistId = 0;
        if (result != undefined && result.media.length > 0) {
            anilistId = result.media[0].id;
        }
        return anilistId;
    }
    public async GetAnimeById(id: number): Promise<any> {
        let result = await this.AnilistClient.media.anime(id);
        return result;
    }
    public async GetMangaById(id: number): Promise<any> {
        let result = await this.AnilistClient.media.manga(id);
        return result;
    }
}