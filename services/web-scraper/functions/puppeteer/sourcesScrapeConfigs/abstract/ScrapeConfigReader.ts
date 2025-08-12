import {ScrapeConfigDataInterface} from "../../interfaces/ScrapeConfig.ts";
import * as console from "node:console";

export abstract class ScrapeConfigReader implements ScrapeConfigDataInterface {
    protected configData: any;

    protected constructor(configData: any) {
        this.configData = configData;
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

}