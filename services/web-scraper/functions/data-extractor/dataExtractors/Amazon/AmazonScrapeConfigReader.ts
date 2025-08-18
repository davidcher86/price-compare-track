import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader.ts";
import config from "@commons/scrape-source-configs/AmazonScrapeConfigs.json";

export class AmazonScrapeConfigReader extends ScrapeConfigReader {

    constructor() {
        console.log("loading Amazon configs:");
        console.log(config)
        super(config);
    }
}