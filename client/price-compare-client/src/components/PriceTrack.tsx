import React, { useState, useEffect, useCallback, useRef, use } from 'react';

import { useFetchData } from '../hooks';
import {retrieveScheduledTrackers} from "../services/api";
import { useNotification } from "./Notifications";
import { useLoading } from "./LoadingSpinner";

interface ScheduledPriceTrackItemProps {
    img: string;
    price: string;
    title: string;
    source: string;
    lastChecked: string;
    key: string;
    scrapeRequestId: string;
    iterationStart: string;
    createdDt: string;
    scrapeCode: string;
    name: string;
    scrapeEngine: string;
    enabled: string;
    iteration: number;
    href: string;
    userId: string;
    iterationType: string;
    id: string;
}

export const PriceTrack: React.FC = () => {

    const { data, setData } = useFetchData<any[]>(() => retrieveScheduledTrackers(process.env.REACT_APP_TMP_USER_ID || ''), "Fetching Data...", "Error retrieving scheduled trackers", [])

    const setScheduledPriceTrackListRef = useRef(setData);
    setScheduledPriceTrackListRef.current = setData;
    // const scheduledPriceTrackList = use(data);

    console.log('Scheduled Trackers Data:', data);
    return (
        <div id="content-component" className="flex flex-row flex-1 min-h-0">
            <div id="search-bar"  className="flex flex-col w-1/5 h-full pl-3 gap-3 theme-border overflow-hidden items-center">
                <p className="text-xl font-normal text-center theme-font h-10 pt-5 pb-3">{"scheduled tracking prices".toUpperCase()}</p>
                <div className="overflow-auto">   
                    {/* {data.map((item: ScheduledPriceTrackItemProps) => <ScheduledPriceTrackItem key={item.key} item={item}  />)} */}
                </div>
            </div>
            
            <div id="search-scrape-result-content"  className="flex flex-col w-4/5 flex-1 min-h-0">
            
                <div id="scrape-bar-header" className="flex flex-col w-full mt-2 h-20 justify-center flex-shrink-0">
                    <p className="block text-xl font-medium text-center theme-font">Track Item prices online stores - Maximize Your Savings</p>
                </div>
                
                <div className="flex-shrink-0">
                    {/* <SearchBar /> */}
                </div>
                
                <div className="flex-1 min-h-0">
                    {/* <ScheduledResults resultData={scrapeDataResult}/> */}
                </div>
            </div>
        </div>
    );
};
