import {SearchBar} from './components/SearchBar';
import {SearchHistoryList} from './components/SearchHistoryList';
import {SimpleButton} from './components/Buttons';
import {SearchResults} from './components/SearchResults';
import {sendSearchRequest} from "./services/api";
import { ReactComponent as AppLogo } from './logos/app-logo.svg';
import { useToast } from "./components/Toasts";
import { useState, useEffect } from "react";
import {retrieveScrapeResultsData,retrieveScrapeHistoryList} from "./services/api";
import webSocketService from "./services/websocket";

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

export default function PriceCompareHome() {

    const { addToast } = useToast();
    const [scrapeDataScrapeResult, setScrapeDataScrapeResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoricalDataItem | null>(null);

    const handleSelectedItem = (item: any) => {
      // console.log('handleSelectedItem called with item:', item);
      // console.log('selected', item);
      setSelectedHistoryItem(item);
  }

    const handleRetrieveUserScrapeHistory = async (userId: string) => {
        try {
          const items = await retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || '');

          const grouped = items.reduce((acc: any, item: any) => {
              if (!acc[item.scrapeRequestId]) {
                acc[item.scrapeRequestId] = [];
              }
              acc[item.scrapeRequestId].push(item);
              return acc;
          }, {} as Record<string, any[]>);

          const output = Object.entries(grouped).map(([key, value]) => ({
              key,
              value: value as HistoricalDataValueItem[]
          }));
          console.log('retrieveScrapeHistoryList', output);
          setHistoricalData(output);
          return output;
        } catch (error) {
          addToast("Error retrieving scrape history", "error");
          console.error('Error retrieving scrape history:', error);
          return [];
        }
    }

    useEffect(() => {
      if (selectedHistoryItem !== null && selectedHistoryItem.key !==undefined) {
          handleRetrieveScrapeDataResult(selectedHistoryItem.key);
      }
    }, [selectedHistoryItem]);

    useEffect(() => {
        handleRetrieveUserScrapeHistory(process.env.REACT_APP_TMP_USER_ID || '');
        
        const userId = process.env.REACT_APP_TMP_USER_ID || '';
        const domain = process.env.REACT_APP_WEBSOCKET_DOMAIN || '';

        webSocketService.connect({
          userId,
          domain,
          onMessage: (data) => {
            handleRetrieveUserScrapeHistory(userId)
              .then((records) => {
                if (records.length > 0) {
                  setSelectedHistoryItem(records[0]);
                }
              });
          }
        });

        const cleanupBeforeUnload = webSocketService.setupBeforeUnloadHandler(userId);
        return () => {
          cleanupBeforeUnload();
          webSocketService.disconnect();
        };
      }, []);

    const handleSearch = async (scrapeRequestId: string) => {
        setIsLoading(true);
        try {
          await retrieveScrapeResultsData(process.env.REACT_APP_TMP_USER_ID || '', scrapeRequestId);
        } catch (error) {
          addToast("Error retrieving scrape results", "error");
          console.error('Error retrieving scrape results:', error);
        } finally {
          setIsLoading(false);
        }
    }

    const handleRetrieveScrapeDataResult = async (scrapeRequestId: string) => {
        setIsLoading(true);
        const items = await retrieveScrapeResultsData(process.env.REACT_APP_TMP_USER_ID || '', scrapeRequestId);
        console.log('handleRetriveScrapeDataResult', items);

        setScrapeDataScrapeResult(items);
        setIsLoading(false);
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
                <SearchHistoryList selectedHistoryItem={selectedHistoryItem} handleSelectedItem={handleSelectedItem} handleRetrieveUserScrpaeHistory={handleRetrieveUserScrapeHistory} historicalData={historicalData} onSelectScrapeData={handleRetrieveScrapeDataResult}/>
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