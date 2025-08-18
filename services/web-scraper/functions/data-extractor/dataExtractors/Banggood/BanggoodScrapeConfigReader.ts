import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader.ts";
import config from "@commons/scrape-source-configs/BanggoodScrapeConfigs.json";

export class BanggoodScrapeConfigReader extends ScrapeConfigReader {

    constructor() {
        console.log("loading Banggood configs:");
        console.log(config)
        super(config);
    }
}