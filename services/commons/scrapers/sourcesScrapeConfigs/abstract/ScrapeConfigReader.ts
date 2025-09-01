import {ScrapeConfigDataInterface} from "../../interfaces/ScrapeConfig";
import * as console from "node:console";

export abstract class ScrapeConfigReader implements ScrapeConfigDataInterface {
    protected configData: any;

    protected constructor(configData: any) {
        this.configData = configData;
    }
    
    getLoadTimeout(): number | null {
        try {
            const configData = this.configData;
            return configData?.loadTimeout || 30000; // Default timeout of 30 seconds
        } catch (error) {
            console.error('Error reading or parsing loadTimeout arg:', error);
            return 30000; // Default timeout as fallback
        }
    }
    
    getLoadWaitUntil(): string | null {
        try {
            const configData = this.configData;
            return configData?.loadWaitUntil || 'networkidle2';
        } catch (error) {
            console.error('Error reading or parsing loadWaitUntil arg:', error);
            return 'networkidle2';
        }
    }

    getSingleItemLoadWaitUntil(): string | null {
        try {
            const configData = this.configData;
            return configData?.singleItemLoadWaitUntil || 'networkidle2';
        } catch (error) {
            console.error('Error reading or parsing singleItemLoadWaitUntil arg:', error);
            return 'networkidle2';
        }
    }

    getSingleItemTimeout(): number | null {
        try {
            const configData = this.configData;
            return configData?.singleItemTimeout || 30000;
        } catch (error) {
            console.error('Error reading or parsing singleItemTimeout arg:', error);
            return 30000;
        }
    }

    getSingleItemPagePriceSelector(): string | null {
        try {
            const configData = this.configData;
            return configData?.singleItemPagePriceSelector || null;
        } catch (error) {
            console.error('Error reading or parsing singleItemPagePriceSelector arg:', error);
            return null;
        }
    }
    
    getSingleItemPageImageSelector(): string | null {
        try {
            const configData = this.configData;
            return configData?.singleItemPageImageSelector || null;
        } catch (error) {
            console.error('Error reading or parsing singleItemPageImageSelector arg:', error);
            return null;
        }
    }

    getSingleItemPageNameSelector(): string | null {
        try {
            const configData = this.configData;
            return configData?.singleItemPageNameSelector || null;
        } catch (error) {
            console.error('Error reading or parsing singleItemPageNameSelector arg:', error);
            return null;
        }
    }
    
    getSingleItemPageWrapper(): string | null {
        try {
            const configData = this.configData;
            return configData?.singleItemPageWrapper || null;
        } catch (error) {
            console.error('Error reading or parsing singleItemPageWrapper arg:', error);
            return null;
        }
    }

    getBlockedResources(): string[] | null {
        try {
            const configData = this.configData;
            return configData?.blockedResources || [];
        } catch (error) {
            console.error('Error reading or parsing blockedResources arg:', error);
            return [];
        }
    }

    getSingleItemPageLoadSelector(): string | null {
        try {
            const configData = this.configData;
            return configData?.singleItemPageLoadSelector || null;
        } catch (error) {
            console.error('Error reading or parsing singleItemPageLoadSelector arg:', error);
            return null;
        }
    }

    public getExtractArgs(): any {
        try {
            const configData = this.configData;
            return configData?.extractArgs || null;
        } catch (error) {
            console.error('Error reading or parsing the config file:', error);
            return null;
        }
    }

    public getUrl(): string | null {
        try {
            const configData = this.configData;
            return configData?.url || null;
        } catch (error) {
            console.error('Error reading or parsing the config file:', error);
            throw error;
        }
    }

    getListIdentifier(): string | null {
        try {
            const configData = this.configData;
            return configData?.listIdentifier || null;
        } catch (error) {
            console.error('Error reading or parsing listIdentifier arg:', error);
            return null;
        }
    }

    getLoadSelector(): string | null {
        try {
            const configData = this.configData;
            return configData?.loadSelector || null;
        } catch (error) {
            console.error('Error reading or parsing loadSelector arg:', error);
            return null;
        }
    }

    getConfigData(): any {
        try {
            return this.configData;
        } catch (error) {
            console.error('Error reading or parsing the config file:', error);
            return null;
        }
    }

    getDisableSec(): boolean | null {
        try {
            const configData = this.configData;
            return configData?.disableSec || null;
        } catch (error) {
            console.error('Error reading or parsing disableSec arg:', error);
            return null;
        }
    }

    getName(): string | null {
        try {
            const configData = this.configData;
            return configData?.name || null;
        } catch (error) {
            console.error('Error reading or parsing loadSenamelector arg:', error);
            return null;
        }
    }

    getHrefHost(): string | null {
        try {
            const configData = this.configData; // Assuming configData is already parsed JSON

            // const fileContent = fs.readFileSync(this.configData, 'utf-8');
            // const configData = JSON.parse(fileContent);
            // console.log(configData?.name);
            return configData?.hrefHost || null;
        } catch (error) {
            console.error('Error reading or parsing hrefHost arg:', error);
            return null;
        }
    }

}