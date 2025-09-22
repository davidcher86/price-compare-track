import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';

import { useFetchData } from '../hooks';
import { useLoading } from "./LoadingSpinner";
import {retrieveScheduledTrackers, getPriceTrackDetails} from "../services/api";
import { ScheduledPriceTrackList } from "./ScheduledPriceTrackList";
import {PriceTrackGraph} from "./PriceTrackGraph";
import { PriceTrackInfo } from "./PriceTrackInfo";
import { useNotification } from "./Notifications";


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

interface PriceTrackDataPoint {
    id: string;
    endScrapeDt: string;
    startScrapeDt: string;
    productName: string;
    productPrice: number;
    scrapeCode: string;
    scrapeDate: string;
    source: string;
    userId: string;
}

export const PriceTrack: React.FC = () => {

    const { addNotification } = useNotification();
    const { showLoading, hideLoading } = useLoading();
    const showLoadingRef = useRef(showLoading);
    const hideLoadingRef = useRef(hideLoading);
    const addNotificationRef = useRef(addNotification);
    
    const { data, setData } = useFetchData<any[]>(() => retrieveScheduledTrackers(process.env.REACT_APP_TMP_USER_ID || ''), "Fetching Data...", "Error retrieving scheduled trackers", [])
    const [priceTrackResults, setPriceTrackResults] = useState<PriceTrackDataPoint[]>([]);
    const [selectedScheduledPriceTrackItem, setSelectedScheduledPriceTrackItem] = useState<ScheduledPriceTrackItemProps | null>(null);

    const memoizedPriceTrackResults = useMemo(() => priceTrackResults, [priceTrackResults]);
    // const setScheduledPriceTrackListRef = useRef(setData);
    // setScheduledPriceTrackListRef.current = setData;
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

    const handleRetrieveScheduledPriceTracks = useCallback(async () => {
            console.log('handleRetrieveScheduledPriceTracks called');
            try {
                showLoadingRef.current("Retrieving data...");
                const items = await retrieveScheduledTrackers(process.env.REACT_APP_TMP_USER_ID || '');
                setData(items);
                return items;
            } catch (error) {
                addNotificationRef.current("Error retrieving scheduled price tracks", "error");
                console.error('Error retrieving scheduled price tracks:', error);
            return [];
            } finally {
                hideLoadingRef.current();
            }
        }, [setData]);

    const handleRetrieveScrapeDataResult = useCallback(async (scrapeCode: string) => {
            console.log('handleRetrieveScrapeDataResult called with ID:', scrapeCode);
            try{
                showLoadingRef.current("Retrieving data...");
                const items: PriceTrackDataPoint[] = await getPriceTrackDetails(scrapeCode);
                console.log('handleRetrieveScrapeDataResult', items);
                setPriceTrackResults(items);
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

    console.log('Rendering selectedScheduledPriceTrackItem with data:', selectedScheduledPriceTrackItem);
    return (
        <div id="content-component" className="flex flex-row flex-1 min-h-0">
            <div id="search-bar" className="flex flex-col w-1/5 h-full pl-3 gap-3 theme-border overflow-hidden items-center bg-gray-50">
                <p className="text-xl font-normal text-center theme-font h-10 pt-5 pb-3">{"scheduled tracking prices".toUpperCase()}</p>
                <div className="scheduled-items-container overflow-auto w-full px-2 pb-4">   
                    <ScheduledPriceTrackList 
                        handleRetrieveScheduledPriceTrackList={handleRetrieveScheduledPriceTracks}
                        scheduledPriceTrackList={memoizedScheduledPriceTrackList}
                        selectedScheduledPriceTrackItem={selectedScheduledPriceTrackItem}
                        handleSelectedScheduledPriceTrack={handleShowPriceTrackDetails}
                    />
                </div>
            </div>
            
            <div id="price-track-result-content"  className="overflow-auto flex flex-col w-4/5 flex-1 min-h-0">
            
                <div id="scrape-bar-header" className="flex flex-col w-full mt-2 h-20 justify-center flex-shrink-0">
                    <p className="block text-xl font-medium text-center theme-font">Track Item prices online stores - Maximize Your Savings</p>
                </div>
                <div className="flex-shrink-0">
                    <PriceTrackInfo priceTrackResults={memoizedPriceTrackResults} priceTrackDetails={selectedScheduledPriceTrackItem} />
                </div>
                
                <div className="flex-1 min-h-0">
                    <PriceTrackGraph priceTrackDetails={memoizedPriceTrackResults}/>
                </div>
            </div>
        </div>
    );
};
