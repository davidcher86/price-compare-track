import {SearchBar} from './components/SearchBar';
import {SearchHistoryList} from './components/SearchHistoryList';
import {SimpleButton} from './components/Buttons';
import {SearchResults} from './components/SearchResults';
import LoadingSpinner from "./components/LoadingSpinner";
import {sendSearchRequest} from "./services/api";
import { ReactComponent as AppLogo } from './logos/app-logo.svg';
import { useNotification } from "./components/Notifications";
import { useState, useEffect, useCallback, useRef } from "react";
import {retrieveScrapeResultsData,retrieveScrapeHistoryList} from "./services/api";
import webSocketService from "./services/websocket";
import { useFetchData } from './hooks';
import { useLoading } from "./components/LoadingSpinner";
import { log } from 'console';

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

export default function PriceCompareHome() {

  const { showLoading, hideLoading } = useLoading();
  const { data, setData } = useFetchData<HistoricalDataValueItem[]>(() => retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || ''), "Fetching Data...", "Error retrieving scrape history", [])
  // console.log('data2', data);
  const { addNotification } = useNotification();
  const [scrapeDataScrapeResult, setScrapeDataScrapeResult] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoricalDataItem | null>(null);

  console.log('data', data);
  // Use ref to store setData to avoid dependency issues
  const setDataRef = useRef(setData);
  setDataRef.current = setData;

  const handleSelectedItem = (item: any) => {
    setSelectedHistoryItem(item);
  }

  const handleNotification = (notification: ScrapeSuccessNotification) => {
    switch (notification.status) {
      case "SCRAPE_COMPLETED":
        addNotification(`Scrape completed successfully for ${notification.source}`, "success");
        console.log("Scrape successful:", notification);
        break;
      default:
        console.warn("Unknown notification status:", notification);
    }
  };

  const handleRetrieveUserScrapeHistory = useCallback(async (userId: string) => {
    try {
      showLoading("Retrieving data...");
      const items = await retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || '');
      setData(items);
      return items;
    } catch (error) {
      addNotification("Error retrieving scrape history", "error");
      console.error('Error retrieving scrape history:', error);
      return [];
    } finally {
      hideLoading();
    }
  }, [showLoading, setData, addNotification, hideLoading]);

    useEffect(() => {
      if (selectedHistoryItem !== null && selectedHistoryItem.key !==undefined) {
          handleRetrieveScrapeDataResult(selectedHistoryItem.key);
      }
    }, [selectedHistoryItem]);

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
      }, []); // Empty dependency array - WebSocket should only connect once

    const handleSearch = async (scrapeRequestId: string) => {
        try {
          await retrieveScrapeResultsData(process.env.REACT_APP_TMP_USER_ID || '', scrapeRequestId);
        } catch (error) {
          addNotification("Error retrieving scrape results", "error");
          console.error('Error retrieving scrape results:', error);
        } finally {
          // setIsLoading(false);
        }
    }

    const handleRetrieveScrapeDataResult = async (scrapeRequestId: string) => {
        // setIsLoading(true);
        const items = await retrieveScrapeResultsData(process.env.REACT_APP_TMP_USER_ID || '', scrapeRequestId);
        console.log('handleRetriveScrapeDataResult', items);

        setScrapeDataScrapeResult(items);
        // setIsLoading(false);
    }

    return (
        <div id='main-window' className="flex h-screen w-screen flex-col overflow-hidden">
            <div id="main-nav-bar" className="flex flex-row justify-between h-20 border-b border-sky-500 flex-shrink-0">
                <div id="logo" className="w-20 h-14"> 
                    <AppLogo width="220" height="70"/>
                </div>
                <p className="block text-xl font-large font-semibold m-4 text-center theme-font ">Yet Another Compare Tool</p>
                      
                <div className="items-center justify-self-end">
                  <SimpleButton label="Register" additionalClasses={'m-3'} onClick={() => console.log('Register clicked')} />
                  <SimpleButton label="Sign-In" additionalClasses={'m-3'} onClick={() => console.log('Sign-In clicked')} />
                </div>
            </div>

            <div id="content-component" className="flex flex-row flex-1 min-h-0">
                <SearchHistoryList selectedHistoryItem={selectedHistoryItem} handleSelectedItem={handleSelectedItem} handleRetrieveUserScrpaeHistory={handleRetrieveUserScrapeHistory} historicalData={data ? data : []} onSelectScrapeData={handleRetrieveScrapeDataResult}/>
                <div id="earch-scrape-result-content"  className="flex flex-col w-4/5 flex-1 min-h-0">

                    <div id="scrape-bar-header" className="flex flex-col w-full mt-2 h-20 justify-center flex-shrink-0">
                      <p className="block text-xl font-medium text-center theme-font">Compare largest online stores - Maximize Your Savings</p>
                    </div>
                    
                    <div className="flex-shrink-0">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    
                    <div className="flex-1 min-h-0">
                        <SearchResults resultData={scrapeDataScrapeResult}/>
                    </div>
                </div>
            </div>
        </div>
    );
}