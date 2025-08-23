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
  const [scrapeDataResult, setScrapeDataResult] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoricalDataItem | null>(null);

  console.log('data', data);
  // Use ref to store setData to avoid dependency issues
  const setDataRef = useRef(setData);
  setDataRef.current = setData;

  const handleSelectedItem = (item: any) => {
    setSelectedHistoryItem(item);
  }

  const handleNotification = useCallback((notification: ScrapeSuccessNotification) => {
    switch (notification.status) {
      case "SCRAPE_COMPLETED":
        addNotification(`Scrape completed successfully for ${notification.source}`, "success");
        break;
      default:
        console.warn("Unknown notification status:", notification);
    }
  }, [addNotification]);

  // Use refs to store stable references to avoid dependency issues
  const showLoadingRef = useRef(showLoading);
  const hideLoadingRef = useRef(hideLoading);
  const addNotificationRef = useRef(addNotification);
  
  // Update refs on each render
  showLoadingRef.current = showLoading;
  hideLoadingRef.current = hideLoading;
  addNotificationRef.current = addNotification;

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
  }, [setData]); // Only depend on setData which should be stable

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
  }, []); // No dependencies - function is now stable

    // Extract the key to avoid unnecessary re-renders
    const selectedItemKey = selectedHistoryItem?.key;
    
    // Add ref to track previous key to prevent duplicate calls
    const prevKeyRef = useRef<string | undefined>(undefined);

    useEffect(() => {
      console.log('useEffect triggered - selectedItemKey:', selectedItemKey, 'prevKey:', prevKeyRef.current);
      if (selectedItemKey && selectedItemKey !== prevKeyRef.current) {
          console.log('Calling handleRetrieveScrapeDataResult for key:', selectedItemKey);
          handleRetrieveScrapeDataResult(selectedItemKey);
          prevKeyRef.current = selectedItemKey;
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemKey]); // Removed handleRetrieveScrapeDataResult dependency since it's now stable

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
      }, [handleNotification]); // Include handleNotification dependency

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
                        <SearchResults resultData={scrapeDataResult}/>
                    </div>
                </div>
            </div>
        </div>
    );
}