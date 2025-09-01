export interface ScrapeConfigDataInterface {
    getConfigData(): any;
    getUrl(): string | null;
    getExtractArgs(): any;
    getLoadSelector(): string | null;
    getListIdentifier(): string | null;
    getDisableSec(): boolean | null
    getName(): string | null;
    getHrefHost(): string | null;
    getBlockedResources(): string[] | null;
    getLoadWaitUntil(): string | null;
    getLoadTimeout(): number | null;
    getSingleItemPageLoadSelector(): string | null;
    getSingleItemPageWrapper(): string | null;
    getSingleItemPagePriceSelector(): string | null;
    getSingleItemPageImageSelector(): string | null;
    getSingleItemPageNameSelector(): string | null;
    getSingleItemLoadWaitUntil(): string | null;
    getSingleItemTimeout(): number | null;
}