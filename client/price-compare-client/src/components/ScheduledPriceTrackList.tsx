import { useEffect, memo, useCallback } from "react";
import { usePopUp } from './Modals';

interface ScheduledPriceTrackListProps {
    selectedScheduledPriceTrackItem: any;
    handleSelectedScheduledPriceTrack: (item: any) => void; 
    handleRetrieveScheduledPriceTrackList: (scrapeCode: string) => Promise<any[]>;
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
                    handleSelectedScheduledPriceTrack={handleSelectedScheduledPriceTrack}
                    // onSelect={() => handleSelectedScheduledPriceTrack(item)}
                />
            ))}
            {(!scheduledPriceTrackList || scheduledPriceTrackList.length === 0) && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">No tracked items</p>
                    <p className="text-xs text-gray-400 mt-1">Start tracking prices to see them here</p>
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
    key: string;
    handleSelectedScheduledPriceTrack: (item: any) => void;
    item: ScheduledPriceTrackItemProps;
}

const ScheduledPriceTrackItem: React.FC<ScheduledPriceTrackItemComponentProps> = memo(({ key, item, handleSelectedScheduledPriceTrack }) => {
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

    const isEnabled = item.enabled === 'true' || item.enabled === '1' || item.enabled === 'enabled';
    console.log('item key:', key);
    return (
        <div className="scheduled-price-track-item bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-3 p-4 border border-gray-200 hover:border-sky-400">
            {/* Image Banner */}
            <div className="image-banner mb-3 relative overflow-hidden rounded-md bg-gray-100">
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
                <div className={`${item.img ? 'hidden' : ''} w-full h-20 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center`}>
                    <span className="text-gray-500 text-sm">No Image</span>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isEnabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {isEnabled ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Item Details */}
            <div className="item-details space-y-2">
                {/* Name/Title */}
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {item.name || item.title || 'Unnamed Item'}
                </h3>

                {/* Source */}
                <div className="flex items-center text-xs text-gray-600">
                    <span className="inline-block w-2 h-2 bg-sky-500 rounded-full mr-2"></span>
                    <span className="font-medium">Source:</span>
                    <span className="ml-1 text-sky-600 font-medium">{item.source || 'Unknown'}</span>
                </div>

                {/* Created Date */}
                <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-3 h-3 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Created:</span>
                    <span className="ml-1">{formatDate(item.createdDt)}</span>
                </div>

                {/* Price (if available) */}
                {item.price && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-600">Current Price:</span>
                        <span className="text-sm font-bold theme-font">{item.price}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <button onClick={() => handleSelectedScheduledPriceTrack(item)} className="flex-1 text-xs py-1.5 px-3 bg-sky-50 text-sky-700 rounded-md hover:bg-sky-100 transition-colors duration-200 font-medium">
                        View Details
                    </button>
                    <button className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-colors duration-200 font-medium ${
                        isEnabled 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}>
                        {isEnabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        </div>
    );
});