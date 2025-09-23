import { useEffect,useRef, memo, useCallback } from "react";
import { usePopUp } from './Modals';
import {deleteScheduledPriceTrack, togglePriceTrackEnabled} from '../services/api';
import { useNotification } from "./Notifications";
import { useLoading } from "./LoadingSpinner";

interface ScheduledPriceTrackListProps {
    selectedScheduledPriceTrackItem: any;
    handleSelectedScheduledPriceTrack: (item: any) => void;
    handleRetrieveScheduledPriceTrackList: () => Promise<any[]>;
    // onSelectScrapeData: (scrapeRequestId: string) => void;
    scheduledPriceTrackList: any[];
    // onNotification?: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const ScheduledPriceTrackList: React.FC<ScheduledPriceTrackListProps> = memo(({ selectedScheduledPriceTrackItem, handleSelectedScheduledPriceTrack, handleRetrieveScheduledPriceTrackList, scheduledPriceTrackList }) => {
    const { openModal } = usePopUp();

    return (
        <div className="scheduled-price-track-list">
            {scheduledPriceTrackList.map(item => (
                <ScheduledPriceTrackItem
                    key={item.id}
                    item={item}
                    handleRetrieveScheduledPriceTrackList={handleRetrieveScheduledPriceTrackList}   
                    handleSelectedScheduledPriceTrack={handleSelectedScheduledPriceTrack}
                    // onSelect={() => handleSelectedScheduledPriceTrack(item)}
                />
            ))}
            {(!scheduledPriceTrackList || scheduledPriceTrackList.length === 0) && (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <svg className="w-12 h-12 mb-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-slate-300">No tracked items</p>
                    <p className="text-xs text-slate-500 mt-1">Start tracking prices to see them here</p>
                </div>
            )}
        </div>
    );
});


interface ScheduledPriceTrackItemProps {
    img: string;
    price: string;
    title: string;
    source: string;
    lastChecked: string;
    key: string;
    scrapeRequestId: string;
    iterationStart: string;
    createdDt: string;
    scrapeCode: string;
    name: string;
    scrapeEngine: string;
    enabled: string;
    iteration: number;
    href: string;
    userId: string;
    iterationType: string;
    id: string;
}

interface ScheduledPriceTrackItemComponentProps {
    handleSelectedScheduledPriceTrack: (item: any) => void;
    handleRetrieveScheduledPriceTrackList: () => Promise<any[]>;
    item: ScheduledPriceTrackItemProps;
}

const ScheduledPriceTrackItem: React.FC<ScheduledPriceTrackItemComponentProps> = memo(({ item, handleSelectedScheduledPriceTrack, handleRetrieveScheduledPriceTrackList }) => {
    const { openModal } = usePopUp();
    const { addNotification } = useNotification();
    const notifyUser = useRef(addNotification);
    const { showLoading, hideLoading } = useLoading();
    const showLoadingRef = useRef(showLoading);
    const hideLoadingRef = useRef(hideLoading);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    const handleDeletePriceTrack = useCallback(async (id: string, itemName: string, scrapeCode: string | null = null) => {
        if (!id) {
            console.error("No id provided for deletion");
            return;
        }

        try {
            openModal({
                title: "Delete Item",
                message: `Are you sure you want to delete this item: ${itemName}?`,
                onYes: () => {
                    // Handle delete logic in a separate async function
                    (async () => {
                        try {
                             // create a promise that waits 3 seconds
                            //  const delay = () => new Promise(resolve => setTimeout(resolve, 3000));
                            showLoadingRef.current("Deleting item...");
                            console.log(`Deleting scheduled price track with id: ${id}`);
                            await deleteScheduledPriceTrack(id, scrapeCode);
                            // await delay(); // simulate network delay
                            notifyUser.current(`Scheduled price track item "${itemName}" deleted successfully`, 'success');
                            await handleRetrieveScheduledPriceTrackList();

                        } catch (deleteError) {
                            notifyUser.current(`Error deleting scheduled price track item "${itemName}"`, "error");
                            console.error('Failed to delete scrape:', deleteError);
                        } finally {
                            hideLoadingRef.current();
                        }
                    })();
                },
                onNo: () => {
                    // Handle cancel (optional, modal will close automatically)
                    console.log('Delete cancelled');
                }
            });
            // const response = await deleteScheduledPriceTrack(scrapeCode);
            // if (response) {
            //     console.log("Scheduled price track deleted successfully");
            // }
        } catch (error) {
            console.error("Error deleting scheduled price track:", error);
        }
    }, [openModal, notifyUser, handleRetrieveScheduledPriceTrackList]);

    const handleTogglePriceTrackEnabled = useCallback(async (id: string, newEnabledState: boolean) => {
        if (!id) {
            console.error("No id provided for toggling enabled state");
            return;
        }

        try {
            openModal({
                title: newEnabledState ? "Enable Item" : "Disable Item",
                message: `Are you sure you want to ${newEnabledState ? 'enable' : 'disable'} this item: ${item.name || item.title}?`,
                onYes: () => {
                    // Handle toggle logic in a separate async function
                    (async () => {
                        try {
                            showLoadingRef.current(newEnabledState ? "Enabling..." : "Disabling...");
                            console.log(`Toggling enabled state for id: ${id} to ${newEnabledState}`);
                            await togglePriceTrackEnabled(id, newEnabledState);
                            // await delay(); // simulate network delay
                            notifyUser.current(`Scheduled price track item "${item.name || item.title}" ${newEnabledState ? 'enabled' : 'disabled'} successfully`, 'success');
                            await handleRetrieveScheduledPriceTrackList();

                        } catch (toggleError) {
                            notifyUser.current(`Error ${newEnabledState ? 'enabling' : 'disabling'} scheduled price track item "${item.name || item.title}"`, "error");
                            console.error('Failed to toggle enabled state:', toggleError);
                        } finally {
                            hideLoadingRef.current();
                        }
                    })();
                },
                onNo: () => {
                    // Handle cancel (optional, modal will close automatically)
                    console.log('Toggle enabled state cancelled');
                }
            });
            // console.log(`Toggling enabled state for id: ${id} to ${newEnabledState}`);
            // await togglePriceTrackEnabled(id, newEnabledState);
            // notifyUser.current(`Scheduled price track item "${item.name || item.title}" ${newEnabledState ? 'enabled' : 'disabled'} successfully`, 'success');
            // await handleRetrieveScheduledPriceTrackList();
        } catch (error) {
            notifyUser.current(`Error ${newEnabledState ? 'enabling' : 'disabling'} scheduled price track item "${item.name || item.title}"`, "error");
            console.error("Error toggling enabled state:", error);
        }
    }, [notifyUser, item.name, item.title, handleRetrieveScheduledPriceTrackList]);


    const isEnabled = item.enabled === 'true' || item.enabled === '1' || item.enabled === 'enabled';
    // console.log('item key:', key);
    return (
        <div className="scheduled-price-track-item bg-slate-700/50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-3 p-4 border border-slate-600/50 hover:border-blue-400/50 hover:bg-slate-600/50">
            {/* Image Banner */}
            <div className="image-banner mb-3 relative overflow-hidden rounded-md bg-slate-600/30">
                {item.img ? (
                    <img 
                        src={item.img} 
                        alt={item.name || item.title || 'Product'} 
                        className="w-full h-20 object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <div className={`${item.img ? 'hidden' : ''} w-full h-20 bg-gradient-to-r from-slate-600/50 to-slate-500/50 flex items-center justify-center`}>
                    <span className="text-slate-400 text-sm">No Image</span>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-all duration-200 hover:scale-105 ${
                        
                        isEnabled 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                    onClick={() => handleTogglePriceTrackEnabled(item.id, !isEnabled)}
                    >
                        {isEnabled ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Item Details */}
            <div className="item-details space-y-2">
                {/* Name/Title */}
                <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-tight">
                    {item.name || item.title || 'Unnamed Item'}
                </h3>

                {/* Source */}
                <div className="flex items-center text-xs text-slate-400">
                    <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    <span className="font-medium">Source:</span>
                    <span className="ml-1 text-blue-400 font-medium">{item.source || 'Unknown'}</span>
                </div>

                {/* Created Date */}
                <div className="flex items-center text-xs text-slate-400">
                    <svg className="w-3 h-3 mr-2 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Created:</span>
                    <span className="ml-1">{formatDate(item.createdDt)}</span>
                </div>

                {/* Price (if available) */}
                {item.price && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-600/50">
                        <span className="text-xs font-medium text-slate-400">Current Price:</span>
                        <span className="text-sm font-bold text-blue-400">{item.price}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <button onClick={() => handleSelectedScheduledPriceTrack(item)} className="flex-1 text-xs py-1.5 px-3 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30 transition-colors duration-200 font-medium border border-blue-500/30">
                        View Details
                    </button>
                    <button className="flex-1 text-xs py-1.5 px-3 rounded-md transition-colors duration-200 font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        onClick={() => handleDeletePriceTrack(item.id, item.name, item.scrapeCode)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
});