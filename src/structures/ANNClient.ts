import { stringify } from 'querystring';
import config from '../config.js';
import { XMLParser } from 'fast-xml-parser';
import { resolve } from 'path';

export default class ANNClient {
    
    private async getANNReport(listCount: number): Promise<Response> {
        let query: string;
        if (listCount == 0) {
            query = "all";
        } else {
            query = listCount.toString();
        }
        let promise = new Promise(resolve => setTimeout(resolve, 1000));
        await promise;
        return await fetch(config.annApiURL + "reports.xml?id=155&nlist=" + query);

    }
    public async getLatestANN(): Promise<number> {
        let response = await this.getANNReport(1);
        let xmlBody = await response.text();
        let jsonBody = new XMLParser().parse(xmlBody);
        return jsonBody.report.item.id;
    }
    public async getNewANNs(annCount: number): Promise<any> {
        let response = await this.getANNReport(annCount);
        let xmlBody = await response.text();
        let jsonBody = new XMLParser().parse(xmlBody);
        return jsonBody.report.item;
    }
    public async getAllANNs(): Promise<any> {
        console.log("Getting All ANNS");
        let response = await this.getANNReport(0);
        console.log("Response Status: " + response.status);
        let xmlBody = await response.text();
        let jsonBody = new XMLParser().parse(xmlBody);
        return jsonBody.report.item;
    }
    
}