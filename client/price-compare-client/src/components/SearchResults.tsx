import { useEffect, useState } from "react";
import { retrieveScrapeHistoryList } from "src/services/api";
import { ReactComponent as GoToPageLogo } from '../logos/go-to-page-icon.svg';

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
        <div id="scrape-results-wrap" className="flex flex-row w-full h-full theme-border border-t">
            {resultData.length == 0 
            ? <p className="text-xl font-normal text-center w-full theme-font">no results</p>
            : resultData.map(item => sourceScrapeDataColumn(item))}
        </div>
    );
}


function sourceScrapeDataColumn(item: ScapeSourceData) {
    // console.log(item);
    // console.log(JSON.parse(JSON.parse(item.results)));
    const scrapeResults = JSON.parse(JSON.parse(item.results));

    return (
        <div id="scrape-source-item" className="flex flex-col overflow-auto w-full h-full items-center">
            <p className="text-xl text-center w-full theme-font font-bold">{item.source}</p>
            {scrapeResults.map((item: SourceResultData) => <SourceResults sourceResult={item} />)}
        </div>
    );
}

interface SourceResultData {
    name: string;
    image?: string;
    price: number;
    href?: string;
}

const SourceResults: React.FC<{ sourceResult: SourceResultData }> = ({ sourceResult }) => {
    const [isOpen, setIsOpen] = useState(false);
    // console.log(isOpen);
    return (
        <div className="bg-blue-200 m-2 rounded-md p-1 max-w-xl">
            <div className="flex flex-row my-2">
                <div className="inline-block result-item-image-container">
                    <img src={sourceResult.image} alt={sourceResult.name.substring(0,120)} className="m-2 w-full h-full object-coverobject-cover" />
                </div>
                <div className="inline-block h-full item-price-wrapper">
                    <GoToPageLogo className="m-2 w-8 justify-self-end cursor-pointer" onClick={() => window.open(sourceResult.href, '_blank')}/>
                    <p className="block text-2xl font-normal text-center">{sourceResult.price}</p>
                </div>
            </div>
            <div className="p-3">
                <p onClick={() => setIsOpen(true)} className="w-full theme-font">{isOpen ? sourceResult.name : sourceResult.name.substring(0,120)}</p>
                {sourceResult.name.length > 80 
                    ? <p className="w-full cursor-pointer font-medium text-sm" onClick={() => setIsOpen(!isOpen)}>{isOpen == false ? "read more..." : "close"}</p> 
                    : null}
            </div>
            
        </div>
    );
}