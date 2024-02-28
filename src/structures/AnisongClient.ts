import config from '../config.js';
export default class AnisongClient {
    private RequestQueue: any[] = [];
    constructor() {
        this.RequestQueue = []
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
        console.log("Current Length of Anisong Queue: " + this.RequestQueue.length);
        let nextRequest = this.RequestQueue.splice(0, 1)[0];
        if (nextRequest == undefined || nextRequest.type == undefined) {
            console.log("Failed to get request data");
            return;
        }
        let result:any;
        switch(nextRequest.type) {
            case ("getAnisongDataFromANNId"):
                result = await this.getAnisongDataFromANNId(nextRequest.params.annId, nextRequest.params.ignoreDuplicate, nextRequest.params.openingFilter, nextRequest.params.endingFilter, nextRequest.params.insertFilter);
                break;
            default:
                console.error("No request of type: " + nextRequest.type);
                return;
        }
        if (result == -1) {
            nextRequest.params.retrycount = nextRequest.params.retrycount != undefined ? nextRequest.params.retrycount + 1 : 1
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

    private async getAnisongDataFromANNId(annId: number, ignoreDuplicate: boolean = false, openingFilter: boolean = true, endingFilter: boolean = true, insertFilter: boolean = true): Promise<any> {
            let response: Response
            try {
                response = await fetch(config.anisongApiURL + "annId_request", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "annId": annId,
                        "ignore_duplicate": ignoreDuplicate,
                        "opening_filter": openingFilter,
                        "ending_filter": endingFilter,
                        "insert_filter": insertFilter
                    })
                });
            } catch (error) {
                console.error("ANISONG GET ERROR");
                console.error(annId);
                console.error(error)
                return -1;
            }
            if (response.status == 429) {
                console.error("RATE LIMIT REACH");
                return -1;
            }
            let jsonText = await response.text();
            let json = JSON.parse(jsonText);
        let anisongs: AnisongData[] = [];
        if (Array.isArray(json)) {
            json.forEach(element => {
                if (element.audio != "" && element.audio != undefined && element.audio != null) {
                    let anisongdata = new AnisongData(element.annSongId, element.annId, element.audio, element.songType, element.animeEngName, element.animeJPName, element.songName, element.animeType);
                    anisongs.push(anisongdata);
                }
            });
        } else {
            console.log("Anisong result was not an array. annId used: " + annId + ". Json Text recieved:");
            console.log(jsonText);
        }
        return anisongs;
    }
}
export class AnisongData {
    constructor(anisongId: number, annId: number, url: string, anisongType: string, animeEng: string, animeJap: string, songName: string, animeType: string) {
        this.anisongId = anisongId;
        this.annId = annId;
        this.url = url;
        this.anisongType = anisongType;
        this.animeEng = animeEng;
        this.animeJap = animeJap;
        this.songName = songName;
        this.animeType = animeType;
        if (this.anisongType.includes("Opening")) {
            this.songType = "OP";
        } else if (this.anisongType.includes("Ending")) {
            this.songType = "ED";
        } else if (this.anisongType.includes("Insert")) {
            this.songType = "IN";
        } else {
            this.songType = "UNKNOWN";
        }
    }
    public anisongId: number;
    public annId: number;
    public url: string;
    public songType: string;
    public anisongType: string;
    public animeEng: string;
    public animeJap: string;
    public songName: string;
    public animeType: string;
}