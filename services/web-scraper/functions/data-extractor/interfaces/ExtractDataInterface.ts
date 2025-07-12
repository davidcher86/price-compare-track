export interface ExtractDataInterface {
    extract: (html: any, userId: string) => Promise<any[]>;
}