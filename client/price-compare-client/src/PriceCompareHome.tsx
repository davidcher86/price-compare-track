import {SearchBar} from './components/SearchBar';
import {SearchHistoryList} from './components/SearchHistoryList';
import {SimpleButton} from './components/Buttons';
import {SearchResults} from './components/SearchResults';
import {sendSearchRequest} from "./services/api";
import { useState, useEffect } from "react";
import {retrieveScrapeResultsData,retrieveScrapeHistoryList} from "./services/api";

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
    const [scrapeDataScrapeResult, setSscrapeDataScrapeResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoricalDataItem | null>(null);

    const handleSelectedItem = (item: any) => {
      // console.log('handleSelectedItem called with item:', item);
      // console.log('selected', item);
      setSelectedHistoryItem(item);
  }

    const handleRetrieveUserScrpaeHistory = async (userId: string) => {
        try {
          const items = await retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || '');
          // console.log('handleRetrieveUserScrpaeHistory', items);
          const grouped = items.reduce((acc: any, item: any) => {
              if (!acc[item.scrapeRequestId]) {
                acc[item.scrapeRequestId] = [];
              }
              acc[item.scrapeRequestId].push(item);
              return acc;
          }, {} as Record<string, any[]>);

          const output = Object.entries(grouped).map(([key, value]) => ({
              key,
              value: value as HistoricalDataValueItem[] // Explicitly type the value
          }));
          console.log('retrieveScrapeHistoryList', output);
          setHistoricalData(output);
          return output;
        } catch (error) {
          console.error('Error retrieving scrape history:', error);
          return [];
        }
        // setHistoricalData(output);
    }

    useEffect(() => {
      // console.log('Selected history item changed:', selectedHistoryItem);
      if (selectedHistoryItem !== null && selectedHistoryItem.key !==undefined) {
          // Call the onSelectScrapeData function with the selected scrapeRequestId
          handleRetriveScrapeDataResult(selectedHistoryItem.key);
          // onSelectScrapeData(selectedHistoryItem.key);
      }
  }, [selectedHistoryItem]);

    useEffect(() => {
        handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '');
        // const wssUri = `ws://localhost:4001?userId=${process.env.REACT_APP_TMP_USER_ID}&domain=${process.env.REACT_APP_WEBSOCKET_DOMAIN}`; // Replace with your WebSocket URL
        const wssUri = `wss://${process.env.REACT_APP_WEBSOCKET_DOMAIN}/prod?userId=${process.env.REACT_APP_TMP_USER_ID}&domain=${process.env.REACT_APP_WEBSOCKET_DOMAIN}`;
        const ws = new WebSocket(wssUri);
        console.log(wssUri)
        ws.onopen = () => {
          console.log("Connected to WebSocket server");
        };

        ws.onmessage = (event) => {
            console.log(event)
          const data = JSON.parse(event.data);

          handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '')
          .then((records) => {
            if (records.length >0 ) {
              setSelectedHistoryItem(records[0]);
            }
          });
          console.log("Message from server:", data);
        };
    
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
    
        ws.onclose = () => {
          console.log("WebSocket connection closed");
        };
    
        const handleBeforeUnload = () => {
            // Optionally notify server explicitly
            ws.send(JSON.stringify({ type: "disconnect", userId: process.env.REACT_APP_TMP_USER_ID }));
            ws.close();
          };
        
          window.addEventListener("beforeunload", handleBeforeUnload);
        

        // Cleanup on component unmount
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
          ws.close();
        };
      }, []);

    // console.log('proc' + process.env.REACT_APP_USER_DETAILS_SERVICE_HOST)
    const handleSearch = async (scrapeRequestId: string) => {
        // console.log('Search initiated with query:', query, 'and sources:', sources);
        setIsLoading(true);
        const response = await retrieveScrapeResultsData(process.env.REACT_APP_TMP_USER_ID || '', scrapeRequestId);
        // await sendSearchRequest(query, sources);
        // Here you would typically call your API to perform the search
        // For example:
        // const results = await sendSearchRequest(query, sources);
        // console.log('Search results:', results);
        setIsLoading(false);
    }

    const handleRetriveScrapeDataResult = async (scrapeRequestId: string) => {
        setIsLoading(true);
        const items = await retrieveScrapeResultsData(process.env.REACT_APP_TMP_USER_ID || '', scrapeRequestId);
        console.log('handleRetriveScrapeDataResult', items);

        setSscrapeDataScrapeResult(items);
        setIsLoading(false);
    }

    return (
        <div id='main-window' className="flex h-screen w-screen flex-col overflow-hidden">
            <div id="main-nav-bar" className="flex flex-row justify-between h-20 p-4 border-b border-sky-500 flex-shrink-0">
                <div id="logo" className="flex w-10 h-full justify-self-start bg-gray-200">
                    logo
                </div>
                <p className="block text-xl font-large font-semibold mb-4 text-center theme-font ">Yet Another Compare Tool</p>
                      
                <div className="items-center justify-self-end">
                  <SimpleButton label="Register" additionalClasses={'ml-2 mr-2'} onClick={() => console.log('Register clicked')} />
                  <SimpleButton label="Sign-In" additionalClasses={'ml-2 mr-2'} onClick={() => console.log('Sign-In clicked')} />
                </div>
            </div>

            <div id="content-component" className="flex flex-row flex-1 min-h-0">
                <SearchHistoryList selectedHistoryItem={selectedHistoryItem} handleSelectedItem={handleSelectedItem} handleRetrieveUserScrpaeHistory={handleRetrieveUserScrpaeHistory} historicalData={historicalData} onSelectScrapeData={handleRetriveScrapeDataResult}/>
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