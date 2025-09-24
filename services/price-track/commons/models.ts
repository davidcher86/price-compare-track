
export interface PriceTrackItem {
    id: string;
    scrapeCode: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createdDt: string;
    img?: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string; // Stored as "true"/"false" string in DynamoDB
    href?: string;
    name?: string;
    query?: string;
}


export interface PriceTrackData {
    image?: string;
    name?: string;
    price: string;
}

export interface ScrapeInfo {
    id: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createdDt: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string; // Stored as "true"/"false" string in DynamoDB
    href: string;
    name?: string;
    bucketName: string;
    bucketKey: string;
    startScrapeDt: string;
    endScrapeDt: string;
    scrapeCode: string;
}

export interface ExtractedData {
    scrapeInfo: ScrapeInfo;
    startScrapeDt: string;
    endScrapeDt: string;
    priceTrackData?: PriceTrackData;
}

export interface ExtractedDataWithPrice {
    scrapeInfo: ScrapeInfo;
    startScrapeDt: string;
    endScrapeDt: string;
    priceTrackData: PriceTrackData;
}

export interface ExtractedDataEvent {
    stepScrapeSiteResult: StepScrapeSiteResult;
}

export interface StepScrapeSiteResult {
    scrapeInfo?: ScrapeInfo;
    bucketKey: string;
    startScrapeDt: string;
    endScrapeDt: string;
}

export interface PriceTrackHistoryRecord {
    id: string;
    userId: string;
    source: string;
    productName?: string;
    productPrice: string;
    scrapeDate: string;
    startScrapeDt: string;
    endScrapeDt: string;
    scrapeCode: string;
}

export interface ApiResponse<T = any> {
    statusCode: number;
    body: string | T;
}

export interface ErrorResponse {
    error: string;
}

export interface AddPriceTrackRequest {
    priceTrackItem?: Partial<PriceTrackItem>;
    source: string;
    scrapeEngine?: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string;
    href?: string;
    name?: string;
    img?: string;
}

export interface ScraperScrapeInfo {
    id: string;
    scrapeCode: string;
    userId: string;
    source: string;
    scrapeEngine?: string;
    createDt: string; // Note: different from createdDt in main ScrapeInfo
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string;
    href: string;
    name?: string;
    query?: string;
}

export interface ScrapeItemEvent {
    id: string;
    userId: string;
    source: string;
    scrapeCode: string;
    scrapeEngine?: string;
    createdDt: string;
    iteration: number;
    iterationType: string;
    iterationStart: string;
    enabled: string;
    href: string;
    name?: string;
}

export interface ErrorMessage {
    status: string;
    message: string;
    data?: any;
}