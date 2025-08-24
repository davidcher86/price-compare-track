import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader";
import config from "./BanggoodScrapeConfigs.json";

export class BanggoodScrapeConfigReader extends ScrapeConfigReader {

    constructor() {
        console.log("loading Banggood configs:");
        console.log(config)
        super(config);
    }
}