import { useEffect, useState } from "react";
import { ReactComponent as GoToPageLogo } from '../logos/go-to-page-icon.svg';
import { ReactComponent as PlusIcon } from '../logos/plus.svg';
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

    const handleTrackItemPrice = async (sourceResult: SourceResultData, source: string): Promise<any> => {
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
        <div id="scrape-results-wrap" className="h-full bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-600/50 overflow-hidden">
            {resultData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <p className="text-lg font-medium text-slate-300">No results yet</p>
                        <p className="text-sm text-slate-400">Start a search to see price comparisons</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row h-full gap-2 p-3">
                    {resultData.map(item => <SourceScrapeDataColumn key={item.scrapeId} item={item} handleTrackItemPrice={handleTrackItemPrice} />)}
                </div>
            )}
        </div>
    );
}


interface SourceScrapeDataColumnProps {
    item: ScapeSourceData;
    handleTrackItemPrice: (sourceResult: SourceResultData, source: string) => void;
}

const SourceScrapeDataColumn: React.FC<SourceScrapeDataColumnProps> = ({ item, handleTrackItemPrice }) => {
    const scrapeResults = JSON.parse(JSON.parse(item.results));

    return (
        <div className="flex flex-col flex-1 max-w-xs bg-slate-700/50 rounded-lg shadow-md border border-slate-600/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 p-2 border-b border-slate-600/50">
                <h3 className="text-lg font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize truncate">
                    {item.source}
                </h3>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-2">
                {scrapeResults.map((sourceResultItem: SourceResultData, index: number) => 
                    <SourceResults 
                        key={`${sourceResultItem.name}-${index}`} 
                        sourceResult={sourceResultItem} 
                        source={item.source} 
                        handleTrackItemPrice={handleTrackItemPrice} 
                    />
                )}
            </div>
        </div>
    );
}

interface SourceResultData {
    key: string;
    name: string;
    image?: string;
    price: number;
    href?: string;
}

const SourceResults: React.FC<{ key: string, sourceResult: SourceResultData, source: string, handleTrackItemPrice: (sourceResult: SourceResultData, source: string) => void }> = ({ key, sourceResult, source, handleTrackItemPrice }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div id={key} className="bg-slate-600/40 rounded-lg p-2 border border-slate-500/50 transition-all duration-300 hover:bg-gradient-to-br hover:from-slate-600/60 hover:to-slate-500/60 hover:border-slate-400/50 hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
            <div className="flex flex-row gap-2 mb-2">
                <div className="w-16 h-16 flex-shrink-0">
                    <img src={sourceResult.image} alt={sourceResult.name.substring(0,60)} className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-end gap-1 mb-1">
                        <button 
                            className="p-1 rounded hover:bg-slate-500/60 hover:shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
                            onClick={() => handleTrackItemPrice(sourceResult, source)}
                            title="Add to price tracking"
                        >
                            <PlusIcon className="w-4 h-4 text-blue-400 group-hover:text-purple-400 transition-colors duration-300" />
                        </button>
                        <button 
                            className="p-1 rounded hover:bg-slate-500/60 hover:shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
                            onClick={() => window.open(sourceResult.href, '_blank')}
                            title="View product"
                        >
                            <GoToPageLogo className="w-4 h-4 text-blue-400 group-hover:text-purple-400 transition-colors duration-300" />
                        </button>
                    </div>
                    <p className="text-lg font-bold text-blue-400 text-center group-hover:text-purple-400 transition-colors duration-300">${sourceResult.price}</p>
                </div>
            </div>
            <div className="text-xs">
                <p className={`text-slate-300 leading-tight transition-all duration-300 ${isOpen ? '' : 'line-clamp-2'}`}>
                    {sourceResult.name}
                </p>
                {sourceResult.name.length > 80 && (
                    <button 
                        className="text-blue-400 hover:text-blue-300 font-medium mt-1 transition-colors duration-200"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? "Show less" : "Read more..."}
                    </button>
                )}
            </div>
        </div>
    );
}