import {ScrapeConfigReader} from "../abstract/ScrapeConfigReader";
import config from './NewEggScrapeConfigs.json';

export class NewEggScrapeConfigReader extends ScrapeConfigReader {

    constructor() {
        console.log("loading NewEgg configs:");
        console.log(config);
        super(config);
    }
}