import { ReactNode } from "react";

export interface ScrapeSource {
    name: string;
}

export interface SearchPayload {
    query: string;
    scrapeSources: ScrapeSource[];
}

export interface ScrapeSourceOption {
    id: string;
    label: string;
    logo: ReactNode;
    // coupons: string;
    // cashback: string;
}