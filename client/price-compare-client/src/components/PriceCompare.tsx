import React, { useMemo } from 'react';
import { useState, useEffect, useCallback, useRef } from "react";

import {SearchResults} from './SearchResults';
import {SearchBar} from './SearchBar';
import {SearchHistoryList} from './SearchHistoryList';
import { useNotification } from "./Notifications";
import { useLoading } from "./LoadingSpinner";
import { useFetchData } from '../hooks';
import {retrieveScrapeResultsData,retrieveScrapeHistoryList} from "../services/api";
import webSocketService from "../services/websocket";

interface HistoricalDataValueItem  {
  scrapeDate: string,
  source: string,
  scrapeRequestId: string,
  query: string,
  userId: string
}

interface HistoricalDataItem {
  key: string;
  value: HistoricalDataValueItem[]; // Replace `any` with the actual type of items in the value array
}

interface ScrapeSuccessNotification {
  status: string;
  source?: string; // Replace `any` with the actual type of items in the value array
}

export const PriceCompare = () => {
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoricalDataItem | null>(null);
    const [scrapeDataResult, setScrapeDataResult] = useState([]);
  
    const { addNotification } = useNotification();
    const { showLoading, hideLoading } = useLoading();
    const { data, setData } = useFetchData<HistoricalDataValueItem[]>(() => retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || ''), "Fetching Data...", "Error retrieving scrape history", [])
    const setDataRef = useRef(setData);
    setDataRef.current = setData;

    // Use refs to store stable references to avoid dependency issues
    const showLoadingRef = useRef(showLoading);
    const hideLoadingRef = useRef(hideLoading);
    const addNotificationRef = useRef(addNotification);
    
    // Update refs on each render
    showLoadingRef.current = showLoading;
    hideLoadingRef.current = hideLoading;
    addNotificationRef.current = addNotification;

    const selectedItemKey = selectedHistoryItem?.key;
    const prevKeyRef = useRef<string | undefined>(undefined);
    
    useEffect(() => {
      console.log('useEffect triggered - selectedItemKey:', selectedItemKey, 'prevKey:', prevKeyRef.current);
      if (selectedItemKey && selectedItemKey !== prevKeyRef.current) {
          console.log('Calling handleRetrieveScrapeDataResult for key:', selectedItemKey);
          handleRetrieveScrapeDataResult(selectedItemKey);
          prevKeyRef.current = selectedItemKey;
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemKey]);

    const handleRetrieveUserScrapeHistory = useCallback(async (userId: string) => {
        console.log('handleRetrieveUserScrapeHistory called');
        try {
            showLoadingRef.current("Retrieving data...");
            const items = await retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || '');
            setData(items);
            return items;
        } catch (error) {
            addNotificationRef.current("Error retrieving scrape history", "error");
            console.error('Error retrieving scrape history:', error);
        return [];
        } finally {
            hideLoadingRef.current();
        }
    }, [setData]);

    const handleRetrieveScrapeDataResult = useCallback(async (scrapeRequestId: string) => {
        console.log('handleRetrieveScrapeDataResult called with ID:', scrapeRequestId);
        try{
            showLoadingRef.current("Retrieving data...");
            const items = await retrieveScrapeResultsData(process.env.REACT_APP_TMP_USER_ID || '', scrapeRequestId);
            console.log('handleRetriveScrapeDataResult', items);
            setScrapeDataResult(items);
        } catch (error) {
            addNotificationRef.current("Error retrieving scrape results", "error");
            console.error('Error retrieving scrape results:', error);
        } finally {
            hideLoadingRef.current();
        }
    }, [hideLoadingRef, showLoadingRef, setScrapeDataResult]); 

    const handleSelectedItem = useCallback((item: any) => {
        setSelectedHistoryItem(item);
    }, [setSelectedHistoryItem]);


    const handleNotification = useCallback((notification: ScrapeSuccessNotification) => {
        switch (notification.status) {
          case "SCRAPE_COMPLETED":
            addNotificationRef.current(`Scrape completed successfully for ${notification.source}`, "success");
            break;
          default:
            console.warn("Unknown notification status:", notification);
        }
    }, [addNotificationRef]);

    useEffect(() => {
        const userId = process.env.REACT_APP_TMP_USER_ID || '';
        const domain = process.env.REACT_APP_WEBSOCKET_DOMAIN || '';

        webSocketService.connect({
            userId,
            domain,
            onMessage: async (data) => {
            console.log('WebSocket message received, refreshing data...', data);
            try {
                const notificationBody: ScrapeSuccessNotification = JSON.parse(data);
                // Fetch fresh data without showing loading spinner (to avoid infinite loop)
                const freshItems = await retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || '');
                // Update the data state with fresh items from WebSocket notification
                setDataRef.current(freshItems);
                handleNotification(notificationBody);
                if (freshItems.length > 0) {
                setSelectedHistoryItem(freshItems[0]);
                }
            } catch (error) {
                console.error('Error updating data from WebSocket:', error);
            }
            }
        });

        const cleanupBeforeUnload = webSocketService.setupBeforeUnloadHandler(userId);
        return () => {
            cleanupBeforeUnload();
            webSocketService.disconnect();
        };
    }, [handleNotification]);

    // Memoize the historical data to prevent unnecessary re-renders
    const memoizedHistoricalData = useMemo(() => data || [], [data]);

    // Memoize the notification function to prevent re-renders
    const memoizedNotification = useCallback((message: string, type?: "success" | "error" | "warning" | "info") => {
        addNotificationRef.current(message, type);
    }, []);

    return (
        <div id="content-component" className="flex flex-row flex-1 min-h-0">
            <SearchHistoryList 
                selectedHistoryItem={selectedHistoryItem} 
                handleSelectedItem={handleSelectedItem} 
                handleRetrieveUserScrapeHistory={handleRetrieveUserScrapeHistory} 
                historicalData={memoizedHistoricalData} 
                onSelectScrapeData={handleRetrieveScrapeDataResult}
                onNotification={memoizedNotification}
            />
            <div id="search-scrape-result-content"  className="flex flex-col w-4/5 flex-1 min-h-0">

                <div id="scrape-bar-header" className="flex flex-col w-full mt-2 h-20 justify-center flex-shrink-0">
                    <p className="block text-xl font-medium text-center theme-font">Compare largest online stores - Maximize Your Savings</p>
                </div>
                
                <div className="flex-shrink-0">
                    <SearchBar />
                </div>
                
                <div className="flex-1 min-h-0">
                    <SearchResults resultData={scrapeDataResult}/>
                </div>
            </div>
        </div>
    );
};