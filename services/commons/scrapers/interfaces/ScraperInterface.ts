export interface ScraperInterface {
    start: (scraperRequestInfo: any) => Promise<any>;
}