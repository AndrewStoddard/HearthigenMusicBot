import config from '../config.js';

export default class AnimeClient {
    private Headers: any;
    constructor() { 
        this.Headers = {};
        this.Headers["Authorization"] = 'Basic ' + btoa(config.hgenApiUser + ':' + config.hgenApiPass);
        this.Headers["Content-Type"] = "application/json";
    }

    public async queryAnisongs(anisongQuery: any): Promise<any[]> {
        let response = await fetch(config.hgenApiURL + "/anime/queryAnisongs", {
            method: "POST",
            headers: this.Headers,
            body: JSON.stringify(anisongQuery)
        });
        let anisongs: any = await response.json();
        return anisongs;
    }

    public async setUserAnilist(discordUser: number, anilistName: string): Promise<boolean> {
        let response = await fetch(config.hgenApiURL + "/anime/setUserAnilist", {
            method: "POST",
            headers: this.Headers,
            body: JSON.stringify({discordId: discordUser, anilistName: anilistName})
        });
        return response.status == 200
    }

    public async queryAnimeName(animeName: string): Promise<any[]> {
        let response = await fetch(config.hgenApiURL + "/anime/queryAnimeName/" + animeName, {
            method: "GET",
            headers: this.Headers
        });
        let animeNames: any = await response.json();
        return animeNames;
    }

    public async querySongName(songName: string): Promise<any[]> {
        let response = await fetch(config.hgenApiURL + "/anime/querySongName/" + songName, {
            method: "GET",
            headers: this.Headers
        });
        let songNames: any = await response.json();
        return songNames;
    }

    public async queryArtistName(artistName: string): Promise<any[]> {
        let response = await fetch(config.hgenApiURL + "/anime/queryArtistName/" + artistName, {
            method: "GET",
            headers: this.Headers
        });
        let artistNames: any = await response.json();
        return artistNames;
    }

    public async queryAnilistName(anilistName: string): Promise<any[]> {
        let response = await fetch(config.hgenApiURL + "/anime/queryAnilistName/" + anilistName, {
            method: "GET",
            headers: this.Headers
        });
        let anilistNames: any = await response.json();
        return anilistNames;
    }

}