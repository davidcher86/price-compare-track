import { useState, useEffect } from "react";
import { retrieveScrapeHistoryList } from "src/services/api";


export default function SearchHistoryList() {
    const [historicalData, setHistoricalData] = useState([]);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    // useEffect(() => {
    //     console.log('SearchHistoryList useEffect called');
    //     //Runs only on the first render
    // }, []);

    // console.log('historicalData', historicalData);
    // console.log('selectedHistoryItem', selectedHistoryItem);
    useEffect(() => {
        const fetchData = async () => {
            // console.log("fetching scrape history")
            try {
                const items = await retrieveScrapeHistoryList('8c62a416-504d-4b82-87f6-94a536aa27da');
                // console.log('res 2', items);
                setHistoricalData(items);
            } catch (error) {
                console.error('Error fetching scrape history:', error);
                setHistoricalData([]);
            };
        };
        fetchData();
    }, []);

    const handleSelectedItem = (item: any) => {

        // console.log('selected', item);
        setSelectedHistoryItem(item.scrapeRequestId);
    }
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
    // console.log('item', item);
    return (
        <div key={key} className="flex w-full h-full" onClick={() => handleSelectedItem(item)}>
            <p className="text-xl font-normal text-center w-full">{item.source}</p>
        </div>
    );
}