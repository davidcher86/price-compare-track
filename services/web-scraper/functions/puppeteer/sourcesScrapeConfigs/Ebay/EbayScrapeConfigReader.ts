import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader.ts";
import config from "./../../../../commons/scrape-source-configs/EbayScrapeConfigs.json";

export class EbayScrapeConfigReader extends ScrapeConfigReader {

    constructor() {
        console.log("loading Ebay configs:");
        console.log(config)
        super(config);
    }
}