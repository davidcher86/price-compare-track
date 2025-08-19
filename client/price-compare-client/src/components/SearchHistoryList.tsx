import { useState, useEffect } from "react";
import { retrieveScrapeHistoryList, deleteScrapeRequest } from "src/services/api";
import { ReactComponent as DeleteIcon } from '../logos/delete-icon.svg';
import {YesNoModal} from "./Modals";
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const setItemForDeletion = (item: any) => {
        setItemToDelete(item);  
        setIsModalOpen(true);
    }

    const handleDeleteScrape = async (item: any) => {
        const scrapeRequestId = item.key;
        const userId = process.env.REACT_APP_TMP_USER_ID || '';
        
        try {
            console.log(`Deleting scrape with ID: ${scrapeRequestId} for user: ${userId}`);
            const requestSuccess = await deleteScrapeRequest(userId, scrapeRequestId);

            console.log('Scrape deleted successfully for user:', userId, 'and scrapeRequestId:', scrapeRequestId);

            if (requestSuccess) 
                await handleRetrieveUserScrpaeHistory(process.env.REACT_APP_TMP_USER_ID || '');
            
            // Optionally, you can refresh the history list after deletion
        } catch (error) {
            console.error('Failed to delete scrape:', error);
        }
    }

    useEffect(() => {
        if (selectedHistoryItem) {
            onSelectScrapeData(selectedHistoryItem.key);
        }
    }, [selectedHistoryItem]);

    const handleModalYes = async (): Promise<void> => {
        console.log('Modal Yes clicked for item:', itemToDelete);
        if (itemToDelete) {
            await handleDeleteScrape(itemToDelete);
        }
        setItemToDelete(null);  
        setIsModalOpen(false);
    }

    const handleModalNo = (): void => {
        setItemToDelete(null);  
        setIsModalOpen(false);
    }

    return (
        <div id="search-bar"  className="flex flex-col w-1/5 h-full gap-3 theme-border overflow-auto items-center">
            <YesNoModal isOpen={isModalOpen} onYes={handleModalYes} onNo={handleModalNo} />
            <p className="text-xl font-normal text-center theme-font pt-5 pb-3">{"search history".toUpperCase()}</p>
            {historicalData.map((item) => <SearchHistoryItem key={item.key} item={item} selectedHistoryItem={selectedHistoryItem} handleSelectedItem={handleSelectedItem} setItemForDeletion={setItemForDeletion} />)}
        </div>
    );
}

interface SearchHistoryItemProps {
    item: any;
    selectedHistoryItem: any;
    handleSelectedItem: (item: any) => void;
    setItemForDeletion: (item: any) => void;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({ item, selectedHistoryItem, handleSelectedItem, setItemForDeletion }) => {
    const sourcesString = item.value.map((entry: { source: string; }) => entry.source).join(", ");
    const scrapeDt = item.value.length > 0 ? item.value[0].scrapeDate : null;

    const scrapeDate = scrapeDt !== null ? moment(scrapeDt).format('h:mm  d/mm/yyyy') : "No scrape date";
    const query = item.value.length > 0 ? item.value[0].query : "No query";

    return (
        <div key={item.key} style={(selectedHistoryItem && item.key === selectedHistoryItem.key) ? {backgroundColor: "rgba(248, 225, 168, 1)"} : {backgroundColor: "rgba(153, 191, 245, 1)"} } className="flex flex-row w-90 h-18 w-11/12 shadow-lg item-borders cursor-pointer" onClick={() => handleSelectedItem(item)}>
            <div className="flex flex-col w-11/12 h-28 justify-start items-start p-2">
                <p className="flex flex-1 text-xs text-black text-center w-full h-6 theme-font">{scrapeDate}</p>
                <p className="text-xl font-normal text-center w-full theme-font">{query}</p>
                <p className="mx-0.5 text-sm font-normal text-left w-full theme-font p-1">{`sources: [${sourcesString}]`}</p>
            </div>
            <div className="flex justify-end m-3">
                <DeleteIcon className="cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    setItemForDeletion(item);
                }}/>
            </div>
        </div>
    );
}

