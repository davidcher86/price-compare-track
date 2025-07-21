import { useEffect, useState } from "react";
import { retrieveScrapeHistoryList } from "src/services/api";

// export default function SearchResults() {

interface SearchResultData {
    resultData: ScapeSourceData[]; // Replace `any` with the actual type of items in the value array
}

interface ScapeSourceData  {
    scrapeId: string,
    startScrapeDt: string,
    endScrapeDt: string,
    scrapeDt: string,
    scrapeDate: string,
    source: string,
    results: any
    scrapeRequestId: "570369bd-e819-4e7c-9580-f091ffb202ac",
    query: string,
    userId: string
}

export const SearchResults: React.FC<SearchResultData> = ({ resultData }) => {
 
    // const [scrapeDataResults, setScrapeDataResults] = useState(resultData);

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
    // console.log('resultData');
    // console.log(resultData);
    return (
        <div id="scrape-results-wrap" className="flex flex-row w-full h-full">
            {resultData.length == 0 
            ? <p className="text-xl font-normal text-center w-full">no results</p>
            : resultData.map(item => sourceScrapeDataColumn(item))}
        </div>
    );
}


function sourceScrapeDataColumn(item: ScapeSourceData) {
    // console.log(item);
    // console.log(JSON.parse(JSON.parse(item.results)));
    const scrapeResults = JSON.parse(JSON.parse(item.results));

    return (
        <div id="scrape-source-item" className="flex flex-col overflow-auto w-full h-full">
            <p className="text-xl font-normal text-center w-full">{item.source}</p>
            {scrapeResults.map((item:SourceResultData) => sourceResults(item))}
        </div>
    );
}

interface SourceResultData {
    name: string;
    img?: string;
    price: number;
}

function sourceResults(sourceResult: SourceResultData) {
    // console.log(sourceResult);
    return (
        <div className="flex flex-col w-full h-full">
            {/* <p className="text-lg font-normal text-center w-full">{sourceResult.name.substring(0,80)}</p> */}
            <img src={sourceResult.img} alt={sourceResult.name.substring(0,80)} className="w-32 h-32 object-cover mx-auto" />
            <p className="text-lg font-normal text-center w-full">{sourceResult.price}</p>
        </div>
    );
}