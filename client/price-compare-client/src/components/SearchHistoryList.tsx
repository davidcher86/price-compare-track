import { useEffect } from "react";
import { retrieveScrapeHistoryList, deleteScrapeRequest } from "src/services/api";
import { ReactComponent as DeleteIcon } from '../logos/delete-icon.svg';
import { usePopUp } from './Modals';
import { useNotification } from "./Notifications";
import moment from "moment";

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

export const SearchHistoryList: React.FC<SearchHistoryListProps> = ({ selectedHistoryItem, handleSelectedItem, handleRetrieveUserScrpaeHistory, onSelectScrapeData, historicalData }) => {

    const { openModal } = usePopUp();
    const { addNotification } = useNotification();

    const handleDeleteScrape = async (item: any) => {
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
                                await handleRetrieveUserScrpaeHistory(userId);
                                addNotification("Scrape history item deleted successfully");
                            } else {
                                addNotification("Error deleting scrape history item", "error");
                            }
                        } catch (deleteError) {
                            addNotification("Error deleting scrape history item", "error");
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
            addNotification("Error opening delete confirmation", "error");
            console.error('Failed to open modal:', error);
        }
    }

    useEffect(() => {
        if (selectedHistoryItem) {
            onSelectScrapeData(selectedHistoryItem.key);
        }
    }, [selectedHistoryItem, onSelectScrapeData]);

    return (
        <div id="search-bar"  className="flex flex-col w-1/5 h-full pl-3 gap-3 theme-border overflow-hidden items-center">
            {/* <YesNoModal isOpen={isModalOpen} onYes={handleModalYes} onNo={handleModalNo} /> */}
            <p className="text-xl font-normal text-center theme-font h-10 pt-5 pb-3">{"search history".toUpperCase()}</p>
            <div className="overflow-auto">   
                {historicalData.map((item) => <SearchHistoryItem key={item.key} item={item} selectedHistoryItem={selectedHistoryItem} handleSelectedItem={handleSelectedItem} handleDeleteScrape={handleDeleteScrape} />)}
            </div>
        </div>
    );
}

interface SearchHistoryItemProps {
    item: any;
    selectedHistoryItem: any;
    handleSelectedItem: (item: any) => void;
    handleDeleteScrape: (item: any) => Promise<void>;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({ item, selectedHistoryItem, handleSelectedItem, handleDeleteScrape }) => {
    const sourcesString = item.value.map((entry: { source: string; }) => entry.source).join(", ");
    const scrapeDt = item.value.length > 0 ? item.value[0].scrapeDate : null;

    const scrapeDate = scrapeDt !== null ? moment(scrapeDt).format('h:mm  d/mm/yyyy') : "No scrape date";
    const query = item.value.length > 0 ? item.value[0].query : "No query";

    return (
        <div key={item.key} style={(selectedHistoryItem && item.key === selectedHistoryItem.key) ? {backgroundColor: "rgba(248, 225, 168, 1)"} : {backgroundColor: "rgba(153, 191, 245, 1)"} } className="flex flex-col w-90 h-18 w-11/12 shadow-lg item-borders cursor-pointer mt-1 mb-1" onClick={() => handleSelectedItem(item)}>
            <div className="flex flex-row">
                <div className="flex flex-col w-10/12 justify-start items-start p-2">
                    <p className="flex text-xs text-black text-center m-1 h-6 theme-font">{scrapeDate}</p>
                    
                </div>

                <div className="m-3">
                    <DeleteIcon className="cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScrape(item);
                    }}/>
                </div>
            </div>
            <div className="flex flex-col justify-end">
                <p className="text-xl font-normal pt-2 pl-2 text-center w-full theme-font">{query}</p>

                <p className="mx-0.5 text-sm font-normal text-left w-full theme-font p-1 m-1">{`sources: [${sourcesString}]`}</p>
            </div>
        </div>
    );
}

