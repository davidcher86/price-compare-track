import { useEffect, useState } from "react";
import { retrieveScrapeHistoryList } from "src/services/api";
import { ReactComponent as GoToPageLogo } from '../logos/go-to-page-icon.svg';
import { usePopUp } from './Modals';
import { addItemPriceTrack } from "../services/api";
import { useNotification } from "./Notifications";
import { useLoading } from "./LoadingSpinner";
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
    img: string,
    results: any
    scrapeRequestId: "570369bd-e819-4e7c-9580-f091ffb202ac",
    query: string,
    userId: string
}

export const SearchResults: React.FC<SearchResultData> = ({ resultData }) => {
    const { openModal, closeModal } = usePopUp();
    const { addNotification } = useNotification();
    const { showLoading, hideLoading } = useLoading();
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
    const handleTrackItemPrice = async (sourceResult: SourceResultData, source: string): Promise<any> => {
        // Open a modal to confirm tracking this item
        openModal({
            title: 'Track Price',
            content: (
                <div>
                    <p>Do you want to track the price for this item?</p>
                    <p className="font-bold mt-2">{sourceResult.name}</p>
                    <p className="mt-1">Current price: ${sourceResult.price}</p>
                </div>
            ),
            onYes: async () => {
                try {
                    const priceTrackItem = {
                        source: source,
                        scrapeEngine: 'puppeteer',
                        iteration: 1,
                        iterationType: 'hourly',
                        iterationStart: new Date().toISOString(),
                        enabled: true.toString(),
                        href: sourceResult.href || '',
                        img: sourceResult.image || '',
                        name: sourceResult.name
                    };
                    showLoading("Adding item to price tracking...");
                    const response = await addItemPriceTrack(process.env.REACT_APP_TMP_USER_ID || '', priceTrackItem);
                    // Here you would call an API to save this item for tracking
                    
                    
                    if (response.status === 200) {
                        console.log('Tracking item:', sourceResult);
                    }
                } catch (error) {
                    console.error('Error adding price track item:', error);
                    addNotification("Error adding price track item", "error");
                } finally {
                    hideLoading();
                    closeModal();
                    addNotification("Item added to price tracking", "success");
                }
            },
            onNo: () => {
                closeModal();
            }
        });
    }
    
    return (
        <div id="scrape-results-wrap" className="flex flex-row w-full h-full theme-border border-t">
            {resultData.length == 0 
            ? <p className="text-xl font-normal text-center w-full theme-font">no results</p>
            : resultData.map(item => <SourceScrapeDataColumn key={item.scrapeId} item={item} handleTrackItemPrice={handleTrackItemPrice} />)}
        </div>
    );
}


interface SourceScrapeDataColumnProps {
    item: ScapeSourceData;
    handleTrackItemPrice: (sourceResult: SourceResultData, source: string) => void;
}

const SourceScrapeDataColumn: React.FC<SourceScrapeDataColumnProps> = ({ item, handleTrackItemPrice }) => {
// function sourceScrapeDataColumn(item: ScapeSourceData) {
    // console.log(item);
    // console.log(JSON.parse(JSON.parse(item.results)));
    const scrapeResults = JSON.parse(JSON.parse(item.results));

    return (
        <div id="scrape-source-item" className="flex flex-col w-full h-full items-center">
            <p className="text-xl text-center w-full theme-font font-bold absolute">{item.source}</p>
            <div className="mt-8 overflow-auto ">
                {scrapeResults.map((sourceResultItem: SourceResultData, index: number) => <SourceResults key={`${sourceResultItem.name}-${index}`} sourceResult={sourceResultItem} source={item.source} handleTrackItemPrice={handleTrackItemPrice} />)}
            </div>
        
        </div>
    );
}

interface SourceResultData {
    name: string;
    image?: string;
    price: number;
    href?: string;
}

const SourceResults: React.FC<{ sourceResult: SourceResultData, source: string, handleTrackItemPrice: (sourceResult: SourceResultData, source: string) => void }> = ({ sourceResult, source, handleTrackItemPrice }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { openModal } = usePopUp();

    
    // console.log(isOpen);
    return (
        <div className="bg-blue-200 m-2 rounded-md p-1 max-w-xl">
            <div className="flex flex-row my-2 justify-between">
                <div className="inline-block result-item-image-container">
                    <img src={sourceResult.image} alt={sourceResult.name.substring(0,120)} className="m-2 w-full h-full object-coverobject-cover" />
                </div>
                <div className="inline-block item-price-wrapper">
                    <div className="flex flex-row justify-end items-center">
                        <img src="/logos/plus.svg" alt="Track item" className="m-2 w-8 justify-self-end cursor-pointer" onClick={() => handleTrackItemPrice(sourceResult, source)}/>
                        <GoToPageLogo className="m-2 w-8 justify-self-end cursor-pointer" onClick={() => window.open(sourceResult.href, '_blank')}/>
                    </div>
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