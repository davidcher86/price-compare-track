export interface ScrapeConfigDataInterface {
    getConfigData(): any;
    getUrl(): string | null;
    getExtractArgs(): any;
    getLoadSelector(): string | null;
    getListIdentifier(): string | null;
    getDisableSec(): boolean | null
    getName(): string | null;
}