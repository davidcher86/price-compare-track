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
        <div id="content-component" className="flex flex-row flex-1 min-h-0 bg-gradient-to-br from-slate-900 to-slate-800">
            <div id="search-bar" className="flex flex-col w-1/5 h-full bg-slate-800/90 backdrop-blur-sm shadow-lg border-r border-slate-600/50 overflow-hidden">
                <div className="p-6 border-b border-slate-600/50 bg-gradient-to-r from-slate-700/50 to-slate-600/50">
                    <h2 className="text-xl font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wide">
                        Scheduled Tracking Prices
                    </h2>
                </div>
                <div className="scheduled-items-container overflow-auto w-full px-4 pb-4 flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">   
                    <ScheduledPriceTrackList 
                        handleRetrieveScheduledPriceTrackList={handleRetrieveScheduledPriceTracks}
                        scheduledPriceTrackList={memoizedScheduledPriceTrackList}
                        selectedScheduledPriceTrackItem={selectedScheduledPriceTrackItem}
                        handleSelectedScheduledPriceTrack={handleShowPriceTrackDetails}
                    />
                </div>
            </div>
            
            <div id="price-track-result-content" className="overflow-auto flex flex-col w-4/5 flex-1 min-h-0 bg-slate-800/60 backdrop-blur-sm">
            
                <div id="scrape-bar-header" className="flex flex-col w-full px-8 py-6 justify-center flex-shrink-0 bg-slate-800/80 shadow-sm border-b border-slate-600/50">
                    <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Track Item prices online stores - Maximize Your Savings
                    </h1>
                    <p className="text-slate-400 text-center mt-2 text-sm">Monitor price changes and get notified of deals</p>
                </div>
                
                <div className="flex-shrink-0 px-6 py-4">
                    <PriceTrackInfo priceTrackResults={memoizedPriceTrackResults} priceTrackDetails={selectedScheduledPriceTrackItem} />
                </div>
                
                <div className="flex-1 min-h-0 px-6 pb-6">
                    <PriceTrackGraph priceTrackDetails={memoizedPriceTrackResults}/>
                </div>
            </div>
        </div>
    );
};

export default PriceTrack;
