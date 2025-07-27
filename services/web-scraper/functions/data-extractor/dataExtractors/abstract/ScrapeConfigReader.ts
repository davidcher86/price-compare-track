export abstract class ScrapeConfigReader {
    protected configData: any;

    protected constructor(configData: any) {
        this.configData = configData;
    }

    public getExtractArgs(): any {
        try {
            // console.log("getExtractArgs");
            const configData = this.configData; // Assuming configData is already parsed JSON
            // const fileContent = this.getConfigData();
            // const configData = JSON.parse(fileContent);
            return configData?.extractArgs || null;
        } catch (error) {
            console.error('Error reading or parsing the config file:', error);
            return null;
        }
    }

    public getUrl(): string | null {
        try {
            // console.log("getUrl");
            const configData = this.configData; // Assuming configData is already parsed JSON

            // const fileContent = fs.readFileSync(this.configData, 'utf-8');
            // const configData = JSON.parse(fileContent);
            // console.log(configData?.url);
            return configData?.url || null;
        } catch (error) {
            console.error('Error reading or parsing the config file:', error);
            throw error;
        }
    }

    getListIdentifier(): string | null {
        try {
            console.log("getListIdentifier");
            const configData = this.configData; // Assuming configData is already parsed JSON

            // const fileContent = fs.readFileSync(this.configData, 'utf-8');
            // const configData = JSON.parse(fileContent);
            return configData?.listIdentifier || null;
        } catch (error) {
            console.error('Error reading or parsing listIdentifier arg:', error);
            return null;
        }
    }

    getLoadSelector(): string | null {
        try {
            // console.log("getLoadSelector");
            const configData = this.configData; // Assuming configData is already parsed JSON

            // const fileContent = fs.readFileSync(this.configData, 'utf-8');
            // const configData = JSON.parse(fileContent);
            // console.log(configData?.loadSelector);

            return configData?.loadSelector || null;
        } catch (error) {
            console.error('Error reading or parsing loadSelector arg:', error);
            return null;
        }
    }

    getConfigData(): any {
        try {
            // console.log("getConfigData");

            return this.configData;
        } catch (error) {
            console.error('Error reading or parsing the config file:', error);
            return null;
        }
    }

    getDisableSec(): boolean | null {
        try {
            const configData = this.configData; // Assuming configData is already parsed JSON

            // const fileContent = fs.readFileSync(this.configData, 'utf-8');
            // const configData = JSON.parse(fileContent);
            // console.log(configData?.disableSec);
            return configData?.disableSec || null;
        } catch (error) {
            console.error('Error reading or parsing disableSec arg:', error);
            return null;
        }
    }

    getName(): string | null {
        try {
            const configData = this.configData; // Assuming configData is already parsed JSON

            // const fileContent = fs.readFileSync(this.configData, 'utf-8');
            // const configData = JSON.parse(fileContent);
            // console.log(configData?.name);
            return configData?.name || null;
        } catch (error) {
            console.error('Error reading or parsing name arg:', error);
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