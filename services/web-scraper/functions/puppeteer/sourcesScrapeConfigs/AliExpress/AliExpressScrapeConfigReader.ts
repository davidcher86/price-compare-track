import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader.ts";
import config from "./AliExpresScrapeConfigs.json";

export class AliExpressScrapeConfigReader extends ScrapeConfigReader {

    constructor() {
        console.log("loading AliExpress configs:");
        console.log(config)
        super(config);
    }
}