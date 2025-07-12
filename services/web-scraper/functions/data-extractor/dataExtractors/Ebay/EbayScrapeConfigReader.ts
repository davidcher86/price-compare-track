import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader";
import config from "./EbayScrapeConfigs.json";

export class EbayScrapeConfigReader extends ScrapeConfigReader {

    constructor() {
        console.log("loading Ebay configs:");
        console.log(config)
        super(config);
    }
}