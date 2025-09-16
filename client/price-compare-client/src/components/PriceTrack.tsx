import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';

import { useFetchData } from '../hooks';
import { useLoading } from "./LoadingSpinner";
import {retrieveScheduledTrackers, getPriceTrackDetails} from "../services/api";
import { ScheduledPriceTrackList } from "./ScheduledPriceTrackList";

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

    const { showLoading, hideLoading } = useLoading();
    const showLoadingRef = useRef(showLoading);
    const hideLoadingRef = useRef(hideLoading);

    const { data, setData } = useFetchData<any[]>(() => retrieveScheduledTrackers(process.env.REACT_APP_TMP_USER_ID || ''), "Fetching Data...", "Error retrieving scheduled trackers", [])
    const [selectedScheduledPriceTrackItem, setSelectedScheduledPriceTrackItem] = useState<ScheduledPriceTrackItemProps | null>(null);

    
    const setScheduledPriceTrackListRef = useRef(setData);
    setScheduledPriceTrackListRef.current = setData;
    // const scheduledPriceTrackList = use(data);

    console.log('Scheduled Trackers Data:', data);
    console.log('selected item', selectedScheduledPriceTrackItem);
    const memoizedScheduledPriceTrackList = useMemo(() => data || [], [data]);

    const selectedScheduledPriceTrackKey = selectedScheduledPriceTrackItem?.scrapeCode;
    const prevSelectedScheduledPriceTrackKeyRef = useRef<string | undefined>(undefined);
    
    useEffect(() => {
        console.log('selectedScheduledPriceTrackItem', selectedScheduledPriceTrackItem,);
        if (selectedScheduledPriceTrackKey && selectedScheduledPriceTrackKey !== prevSelectedScheduledPriceTrackKeyRef.current) {
            console.log('Calling handleRetrieveScrapeDataResult for key:', selectedScheduledPriceTrackKey);
            handleRetrieveScrapeDataResult(selectedScheduledPriceTrackItem?.scrapeCode || '');
            prevSelectedScheduledPriceTrackKeyRef.current = selectedScheduledPriceTrackKey;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedScheduledPriceTrackItem]);

    const handleRetrieveScrapeDataResult = useCallback(async (scrapeCode: string) => {
            console.log('handleRetrieveScrapeDataResult called with ID:', scrapeCode);
            try{
                showLoadingRef.current("Retrieving data...");
                const items = await getPriceTrackDetails(scrapeCode);
                console.log('handleRetrieveScrapeDataResult', items);
                // setScrapeDataResult(items);
            } catch (error) {
                // addNotificationRef.current("Error retrieving scrape results", "error");
                console.error('Error retrieving scrape results:', error);
            } finally {
                hideLoadingRef.current();
            }
    }, [hideLoadingRef, showLoadingRef]);

    const handleShowPriceTrackDetails = useCallback((item: any) => {
        setSelectedScheduledPriceTrackItem(item);
    }, [setSelectedScheduledPriceTrackItem]);

    return (
        <div id="content-component" className="flex flex-row flex-1 min-h-0">
            <div id="search-bar" className="flex flex-col w-1/5 h-full pl-3 gap-3 theme-border overflow-hidden items-center bg-gray-50">
                <p className="text-xl font-normal text-center theme-font h-10 pt-5 pb-3">{"scheduled tracking prices".toUpperCase()}</p>
                <div className="scheduled-items-container overflow-auto w-full px-2 pb-4">   
                    <ScheduledPriceTrackList 
                        scheduledPriceTrackList={memoizedScheduledPriceTrackList}
                        selectedScheduledPriceTrackItem={selectedScheduledPriceTrackItem}
                        handleSelectedScheduledPriceTrack={handleShowPriceTrackDetails}
                        handleRetrieveScheduledPriceTrackList={async () => []}
                        // onSelectScrapeData={() => {}}
                    />
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
