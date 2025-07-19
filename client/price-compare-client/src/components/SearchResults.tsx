import { useEffect, useState } from "react";
import { retrieveScrapeHistoryList } from "src/services/api";

export default function SearchResults() {
    const [scrapeHistory, setScrapeHistory] = useState([]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const res = await retrieveScrapeHistoryList('8c62a416-504d-4b82-87f6-94a536aa27da');
    //             console.log('res', res);
    //         } catch (error) {
    //             console.error('Error fetching scrape history:', error);
    //             setScrapeHistory([]);
    //         };
    //     };
    //     fetchData();
    // }, []);

    return (
        <div id="search-scrape-bar" className="flex w-full h-full">
            <p className="text-xl font-normal text-center w-full">results</p>
        </div>
    );
}


function SearchResultItem({ key, result }: { key: any; result: any }) {
    return (
        <div id="search-scrape-bar" className="flex w-full h-full">
            <p className="text-xl font-normal text-center w-full">item</p>
        </div>
    );
}