import { useState, useEffect } from "react";
import { retrieveScrapeHistoryList, deleteScrapeRequest } from "src/services/api";
import { ReactComponent as DeleteIcon } from '../logos/delete-icon.svg';

interface SearchHistoryListProps {
    selectedHistoryItem: any;
    handleSelectedItem: (item: any) => void; 
    handleRetrieveUserScrpaeHistory: (userId: string) => Promise<any[]>;
    onSelectScrapeData: (scrapeRequestId: string) => void;
    historicalData: any[];
}   

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

// export default function SearchHistoryList(onSelectScrapeData: any) {
export const SearchHistoryList: React.FC<SearchHistoryListProps> = ({ selectedHistoryItem, handleSelectedItem, handleRetrieveUserScrpaeHistory, onSelectScrapeData, historicalData }) => {
 
    
    // const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([]);
    // const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoricalDataItem | null>(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         await handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '');
    //     }
    //     fetchData();
    // }, []);

    // console.log('historicalData', historicalData);
    // console.log('selectedHistoryItem', selectedHistoryItem);
    // useEffect(() => {
    //     const fetchData = async () => {
    //         // console.log("fetching scrape history")
    //         try {
    //             const historyData: any[] = await handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '')
    //             setHistoricalData(historyData);
    //             // const items = await retrieveScrapeHistoryList(process.env.REACT_APP_TMP_USER_ID || '');
    //             // // console.log('res 2', items);
    //             // const grouped = items.reduce((acc: any, item: any) => {
    //             //     if (!acc[item.scrapeRequestId]) {
    //             //       acc[item.scrapeRequestId] = [];
    //             //     }
    //             //     acc[item.scrapeRequestId].push(item);
    //             //     return acc;
    //             // }, {} as Record<string, any[]>);
    //             // // console.log(grouped);
    //             // const output: any[] = Object.entries(grouped).map(([key, value]) => ({
    //             //     key,
    //             //     value
    //             // }));
    //             // // console.log(output);

    //             // setHistoricalData(output);
    //         } catch (error) {
    //             console.error('Error fetching scrape history:', error);
    //             setHistoricalData([]);
    //         };
    //     };
    //     fetchData();
    // }, []);

    const handleDeleteScrape = async (item: any) => {
        const scrapeRequestId = item.key;
        const userId = process.env.REACT_APP_TMP_USER_ID || '';
        
        try {
            console.log(`Deleting scrape with ID: ${scrapeRequestId} for user: ${userId}`);
            const requestSuccess = await deleteScrapeRequest(userId, scrapeRequestId);
// const requestSuccess = true
            console.log('Scrape deleted successfully for user:', userId, 'and scrapeRequestId:', scrapeRequestId);

            if (requestSuccess) 
                await handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '');
            
            // Optionally, you can refresh the history list after deletion
        } catch (error) {
            console.error('Failed to delete scrape:', error);
        }
    }

    useEffect(() => {
        // console.log('Selected history item changed:', selectedHistoryItem);
        if (selectedHistoryItem) {
            onSelectScrapeData(selectedHistoryItem.key);
        }
    }, [selectedHistoryItem]);

    return (
        <div id="search-bar"  className="flex flex-col w-1/5 h-full gap-3 theme-border overflow-auto items-center">
            <p className="text-xl font-normal text-center theme-font pt-5 pb-3">{"search history".toUpperCase()}</p>
            {historicalData.map((item) => <SearchHistoryItem key={item.key} item={item} handleDeleteScrape={handleDeleteScrape} selectedHistoryItem={selectedHistoryItem} handleSelectedItem={handleSelectedItem} />)}
        </div>
    );
}

interface SearchHistoryItemProps {
    item: any;
    selectedHistoryItem: any;
    handleSelectedItem: (item: any) => void; 
    handleDeleteScrape: (item: any) => void;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({ item, selectedHistoryItem, handleDeleteScrape, handleSelectedItem }) => {
    const sourcesString = item.value.map((entry: { source: string; }) => entry.source).join(", ");
    const query = item.value.length > 0 ? item.value[0].query : "No query";

    return (
        <div key={item.key} style={(selectedHistoryItem && item.key === selectedHistoryItem.key) ? {backgroundColor: "rgba(248, 225, 168, 1)"} : {backgroundColor: "rgba(153, 191, 245, 1)"} } className="flex flex-row w-90 h-18 w-11/12 shadow-lg item-borders cursor-pointer" onClick={() => handleSelectedItem(item)}>
            <div className="flex flex-col w-11/12 h-18 justify-start items-start p-2">
                <p className="text-xl font-normal text-center w-full theme-font text-lg font-medium">{query}</p>
                <p className="mx-2.5 text-sm font-normal text-left w-full theme-font p-1">{`sources: [${sourcesString}]`}</p>
            </div>
            <div className="flex justify-end m-3">
                <DeleteIcon className="cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteScrape(item);
                }}/>
            </div>
        </div>
    );
}

