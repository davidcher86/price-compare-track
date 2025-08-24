import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader";
import config from "./AliExpressScrapeConfigs.json";

export class AliExpressScrapeConfigReader extends ScrapeConfigReader {

    constructor() {
        console.log("loading AliExpress configs:");
        console.log(config)
        super(config);
    }
}