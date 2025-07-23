import {SearchBar} from './components/SearchBar';
import {SearchHistoryList} from './components/SearchHistoryList';
import {SearchResults} from './components/SearchResults';
import {sendSearchRequest} from "./services/api";
import { useState, useEffect } from "react";
import {retrieveScrapeResultsData,retrieveScrapeHistoryList} from "./services/api";

// interface HistoricalDataValueItem  {
//   scrapeDate: string,
//   source: string,
//   scrapeRequestId: "570369bd-e819-4e7c-9580-f091ffb202ac",
//   query: string,
//   userId: string
// }

// interface HistoricalDataItem {
//   key: string;
//   value: HistoricalDataValueItem[]; // Replace `any` with the actual type of items in the value array
// }

export default function PriceCompareHome() {
    const [scrapeDataScrapeResult, setSscrapeDataScrapeResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    

    const handleRetrieveUserScrpaeHistory = async (userId: string) => {
        try {
          const items = await retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || '');
          console.log('handleRetrieveUserScrpaeHistory', items);
          const grouped = items.reduce((acc: any, item: any) => {
              if (!acc[item.scrapeRequestId]) {
                acc[item.scrapeRequestId] = [];
              }
              acc[item.scrapeRequestId].push(item);
              return acc;
          }, {} as Record<string, any[]>);
          // console.log(grouped);
          const output = Object.entries(grouped).map(([key, value]) => ({
              key,
              value
          }));
          setHistoricalData(output);
          return output;
        } catch (error) {
          console.error('Error retrieving scrape history:', error);
          return [];
        }
        // setHistoricalData(output);
    }

    // useEffect(() => {
    //   const fetchHistoricalScrapeData = async () => {
    //     const data: any[] = await handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '')
    //     setHistoricalData(data);
    //     setIsLoading(false);
    //   }
    //   setIsLoading(true);
    //   fetchHistoricalScrapeData();
    // }, []);

    useEffect(() => {
        // const fetchHistoricalScrapeData = async () => {
        //   const data: any[] = await handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '')
        //   setHistoricalData(data);
        //   setIsLoading(false);
        // }
        // setIsLoading(true);
        // fetchHistoricalScrapeData();
        handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '');
        // const wssUri = `ws://localhost:4001?userId=${process.env.REACT_APP_TMP_USER_ID}&domain=${process.env.REACT_APP_WEBSOCKET_DOMAIN}`; // Replace with your WebSocket URL
        const wssUri = `wss://${process.env.REACT_APP_WEBSOCKET_DOMAIN}/prod?userId=${process.env.REACT_APP_TMP_USER_ID}&domain=${process.env.REACT_APP_WEBSOCKET_DOMAIN}`;
        const ws = new WebSocket(wssUri);
        console.log(wssUri)
        ws.onopen = () => {
          console.log("Connected to WebSocket server");
        //   ws.send(JSON.stringify({ action: "subscribe", message: "Hello Server!" }));
        };
    
        // const fetchHistoricalScrapeData = async () => {
        //   const data: any[] = await handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '')
        //   // setHistoricalData(data);
        //   setIsLoading(false);
        // }

        ws.onmessage = (event) => {
            console.log(event)
          const data = JSON.parse(event.data);

          handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '');
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
        // console.log('res 3', items);

        setSscrapeDataScrapeResult(items);
        setIsLoading(false);
    }

    return (
        <div id='main-window' className="flex h-screen w-screen flex-col">
            <div id="main-nav-bar" className="flex flex-row justify-between h-20  p-4 border-b border-sky-500">
                <div id="logo" className="flex  w-10 h-full justify-self-start bg-gray-200">
                    logo
                </div>
                <div className="items-center justify-self-end">
                    {/* <button className="p-4 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg">Add to Edge</button> */}
                    <button className="p-4 text-sm">Register</button>
                    <button className="p-4 text-sm">Sign-In</button>
                </div>
            </div>

            <div id="content-component" className="flex flex-row h-full">
                <SearchHistoryList handleRetrieveUserScrpaeHistory={handleRetrieveUserScrpaeHistory} historicalData={historicalData} onSelectScrapeData={handleRetriveScrapeDataResult}/>
                <div id="result-content"  className="flex flex-col 0 w-4/5 h-full">

                    <div id="search-scrape-bar" className="flex w-full h-28">
                        <p className="text-xl font-medium mb-4 text-center">Compare pices of online stores - Maximize Your Savings</p>
                    </div>
                    
                    <SearchBar onSearch={handleSearch} />
                    
                    <SearchResults resultData={scrapeDataScrapeResult}/>
                </div>
            </div>
        </div>
        // <div>
        //         <div className="flex flex-col border-b h-screen">
        //             <div className="flex justify-end flex-row items-center p-4 border-b">
        //                 <div className="items-center gap-6">
        //                     <button className="p-4 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg">Add to Edge</button>
        //                     <button className="p-4 text-sm">Register</button>
        //                     <button className="p-4 text-sm">Sign-In</button>
        //                 </div>
        //             </div>

        //             <div id="main-window" className="flex h-screen lex-row">
        //                 <div id="scrape-history" className="grow-2 basis-1/5 justify-self-start p-12  h-12 bg-gray-400 border-b">
        //                     dcsdcs
        //                 </div>

                        
        //                 <div className="flex flex-col  basis-4/5 p-2">
        //                     <p className="text-xl font-medium mb-4 text-center">Compare pices of online stores - Maximize Your Savings</p>
        //                     <div className="flex items-center w-3/6 m-4 border-2 border-red-600 rounded-full p-2">
        //                         <input
        //                             type="text"
        //                             placeholder="Search Stores Online"
        //                             className="flex-1 outline-none text-lg"
        //                         />
        //                     </div>

        //                     <div className="flex flex-row justify-center flex-wrap gap-6 py-10">

                            //     {stores.map((store, i) => (
                            //         <div onClick={() => dispatch({ type: 'TOGGLE_SEARCH_RESOURCES', payload: store.id })} key={i} className="flex flex-col items-center w-28 text-center cursor-pointer">
                            //             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-white">
                            //                 {store.logo}
                            //             </div>
                            //             <div className="mt-2 text-sm font-medium">{store.id}</div>
                            //                 <Checkbox
                            //                     checked={state.checkedSources.includes(store.id)}
                            //                     onChange={() => dispatch({ type: 'TOGGLE_SEARCH_RESOURCES', payload: store.id })}
                            //                     nameId={store.id} />
                            //             {/*<div className="text-xs text-red-600">{store.coupons}</div>*/}
                            //             {/*<div className="text-xs text-red-600">{store.cashback}</div>*/}
                            //         </div>
                            //     ))}
                            // </div>

        //                     <div id="scrape-results" className="flex flex-col gap-4">
        //                         <div>results</div>
        //                     </div>
        //                 </div>
        //             </div> 
        //         </div> 
        //     {/* </div> */}
        // </div>
    );
}