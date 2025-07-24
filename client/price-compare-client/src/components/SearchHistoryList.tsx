import { useState, useEffect } from "react";
import { retrieveScrapeHistoryList } from "src/services/api";

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

    useEffect(() => {
        // console.log('Selected history item changed:', selectedHistoryItem);
        if (selectedHistoryItem) {
            // Call the onSelectScrapeData function with the selected scrapeRequestId
            onSelectScrapeData(selectedHistoryItem.key);
        }
    }, [selectedHistoryItem]);

    // const handleSelectedItem = (item: any) => {
    //     // console.log('handleSelectedItem called with item:', item);
    //     // console.log('selected', item);
    //     setSelectedHistoryItem(item);
    // }
    // console.log('detaildata', historicalData);
    return (
        <div id="search-bar"  className="flex flex-col w-1/5 h-full border-r border-sky-500">
            <p className="text-xl font-normal text-center">history</p>
            {historicalData.map((item, index) => <SearchHistoryItem key={index} item={item} handleSelectedItem={handleSelectedItem} />)}
        </div>
    );
}

interface SearchHistoryItemProps {
    key: any,
    item: any; // Replace `any` with the actual type of `item`
    handleSelectedItem: (item: any) => void; // Replace `any` with the actual type
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({ key, item, handleSelectedItem }) => {
    // console.log( item);
    const sourcesString = item.value.map((entry: { source: string; }) => entry.source).join(", ");
    const query = item.value.length > 0 ? item.value[0].query : "No query";
    // console.log( sourcesString);
    return (
        <div key={key} className="flex w-90 h-16 m-2 bg-orange-500  item-borders" onClick={() => handleSelectedItem(item)}>
            <p className="text-xl font-normal text-center w-full">{`${query} - [${sourcesString}]`}</p>
        </div>
    );
}