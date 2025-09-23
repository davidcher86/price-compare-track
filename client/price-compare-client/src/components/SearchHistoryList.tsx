import { useEffect, memo, useCallback } from "react";
import { deleteScrapeRequest } from "src/services/api";
import { ReactComponent as DeleteIcon } from '../logos/delete-icon.svg';
import { usePopUp } from './Modals';
import { useNotification } from "./Notifications";
import moment from "moment";

interface SearchHistoryListProps {
    selectedHistoryItem: any;
    handleSelectedItem: (item: any) => void; 
    handleRetrieveUserScrapeHistory: (userId: string) => Promise<any[]>;
    onSelectScrapeData: (scrapeRequestId: string) => void;
    historicalData: any[];
    onNotification?: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const SearchHistoryList: React.FC<SearchHistoryListProps> = memo(({ selectedHistoryItem, handleSelectedItem, handleRetrieveUserScrapeHistory, onSelectScrapeData, historicalData, onNotification }) => {

    const { openModal } = usePopUp();
    const { addNotification } = useNotification();
    
    // Use the prop notification function if provided, otherwise fall back to context
    const notifyUser = onNotification || addNotification;

    const handleDeleteScrape = useCallback(async (item: any) => {
        const scrapeRequestId = item.key;
        const userId = process.env.REACT_APP_TMP_USER_ID || '';
        
        try {
            openModal({
                title: "Delete Item",
                message: "Are you sure you want to delete this item?",
                onYes: () => {
                    // Handle delete logic in a separate async function
                    (async () => {
                        try {
                            // Actually delete the scrape
                            console.log(`Deleting scrape with ID: ${scrapeRequestId} for user: ${userId}`);
                            const requestSuccess = await deleteScrapeRequest(userId, scrapeRequestId);
                            
                            console.log('Scrape deleted successfully for user:', userId, 'and scrapeRequestId:', scrapeRequestId);
                            
                            if (requestSuccess) {
                                await handleRetrieveUserScrapeHistory(userId);
                                notifyUser("Scrape history item deleted successfully");
                            } else {
                                notifyUser("Error deleting scrape history item", "error");
                            }
                        } catch (deleteError) {
                            notifyUser("Error deleting scrape history item", "error");
                            console.error('Failed to delete scrape:', deleteError);
                        }
                    })();
                },
                onNo: () => {
                    // Handle cancel (optional, modal will close automatically)
                    console.log('Delete cancelled');
                }
            });
        } catch (error) {
            notifyUser("Error opening delete confirmation", "error");
            console.error('Failed to open modal:', error);
        }
    }, [notifyUser, handleRetrieveUserScrapeHistory, openModal]);

    useEffect(() => {
        if (selectedHistoryItem) {
            onSelectScrapeData(selectedHistoryItem.key);
        }
    }, [selectedHistoryItem, onSelectScrapeData]);

    return (
        <div id="search-bar" className="flex flex-col w-1/5 h-full bg-white/90 backdrop-blur-sm shadow-lg border-r border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-xl font-semibold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wide">
                    Search History
                </h2>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">   
                {historicalData.map((item) => <SearchHistoryItem key={item.key} item={item} selectedHistoryItem={selectedHistoryItem} handleSelectedItem={handleSelectedItem} handleDeleteScrape={handleDeleteScrape} />)}
            </div>
        </div>
    );
});

interface SearchHistoryItemProps {
    item: any;
    selectedHistoryItem: any;
    handleSelectedItem: (item: any) => void;
    handleDeleteScrape: (item: any) => Promise<void>;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = memo(({ item, selectedHistoryItem, handleSelectedItem, handleDeleteScrape }) => {
    const sourcesString = item.value.map((entry: { source: string; }) => entry.source).join(", ");
    const scrapeDt = item.value.length > 0 ? item.value[0].scrapeDate : null;

    const scrapeDate = scrapeDt !== null ? moment(scrapeDt).format('h:mm A · MMM D, YYYY') : "No scrape date";
    const query = item.value.length > 0 ? item.value[0].query : "No query";
    const isSelected = selectedHistoryItem && item.key === selectedHistoryItem.key;
    
    return (
        <div 
            key={item.key} 
            className={`
                group relative flex flex-col w-full rounded-xl shadow-sm border transition-all duration-200 cursor-pointer
                hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                ${isSelected 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }
            `} 
            onClick={() => handleSelectedItem(item)}
        >
            <div className="flex flex-row justify-between items-start p-4">
                <div className="flex flex-col flex-1 min-w-0">
                    <time className={`text-xs font-medium mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        {scrapeDate}
                    </time>
                    <h3 className={`text-base font-semibold mb-2 line-clamp-2 ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                        {query}
                    </h3>
                    <div className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        <span className="font-medium">Sources:</span>
                        <span className="ml-1">{sourcesString}</span>
                    </div>
                </div>

                <button
                    className="ml-3 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScrape(item);
                    }}
                    aria-label="Delete search history item"
                >
                    <DeleteIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

