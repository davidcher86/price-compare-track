import React, { memo, useMemo, useCallback } from 'react';

// TypeScript interfaces
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

interface PriceTrackDataPoint {
    id: string;
    endScrapeDt: string;
    startScrapeDt: string;
    productName: string;
    productPrice: number;
    scrapeCode: string;
    scrapeDate: string;
    source: string;
    userId: string;
}

interface PriceTrackInfoProps {
    priceTrackDetails: ScheduledPriceTrackItemProps | null;
    priceTrackResults: PriceTrackDataPoint[] | null;
}

interface FormattedTrackInfo {
    displayName: string;
    displayPrice: string;
    isEnabled: boolean;
    formattedCreatedDate: string;
    formattedLastChecked: string;
    iterationInfo: string;
    statusBadgeColor: string;
    statusText: string;
}

export const PriceTrackInfo: React.FC<PriceTrackInfoProps> = memo(({ priceTrackDetails, priceTrackResults }) => {
    // Component implementation
    // Format date utility function
    const formatDate = useCallback((dateString: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid Date';
        }
    }, []);

    // Format iteration type utility function
    const formatIterationType = useCallback((type: string): string => {
        return type?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown';
    }, []);

    // Memoized formatted track information
    const formattedInfo: FormattedTrackInfo | null = useMemo(() => {
        if (!priceTrackDetails) return null;

        const isEnabled = priceTrackDetails.enabled === 'true' || 
                         priceTrackDetails.enabled === '1' || 
                         priceTrackDetails.enabled === 'enabled';

        return {
            displayName: priceTrackDetails.name || priceTrackDetails.title || 'Unnamed Item',
            displayPrice: priceTrackDetails.price || 'N/A',
            isEnabled,
            formattedCreatedDate: formatDate(priceTrackDetails.createdDt),
            formattedLastChecked: formatDate(priceTrackDetails.lastChecked),
            iterationInfo: `${priceTrackDetails.iteration || 0} times · ${formatIterationType(priceTrackDetails.iterationType)}`,
            statusBadgeColor: isEnabled ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200',
            statusText: isEnabled ? 'Active Tracking' : 'Inactive'
        };
    }, [priceTrackDetails, formatDate, formatIterationType]);

    // Handle external link click
    const handleExternalLinkClick = useCallback(() => {
        if (priceTrackDetails?.href) {
            window.open(priceTrackDetails.href, '_blank', 'noopener,noreferrer');
        }
    }, [priceTrackDetails?.href]);

    // Handle image error
    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const placeholderDiv = target.nextElementSibling as HTMLElement;
        if (placeholderDiv) {
            placeholderDiv.classList.remove('hidden');
        }
    }, []);

    // Return empty state if no details
    if (!priceTrackDetails || !formattedInfo) {
        return (
            <div className="price-track-info-container bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mx-4 mb-4 shadow-sm">
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Item Selected</h3>
                    <p className="text-sm text-gray-400 text-center max-w-md">
                        Select a price tracking item from the sidebar to view detailed information and price history.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="price-track-info-container bg-gradient-to-r from-white to-blue-50 border border-sky-200 rounded-xl p-6 mx-4 mb-4 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${formattedInfo.statusBadgeColor}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${formattedInfo.isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {formattedInfo.statusText}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {priceTrackDetails.scrapeEngine || 'Scraper'}
                        </span>
                    </div>
                    
                    {/* Product Name */}
                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                        {formattedInfo.displayName}
                    </h2>
                    
                    {/* Source Information */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-sky-500 rounded-full mr-2"></span>
                            <span className="font-medium">Source:</span>
                            <span className="ml-1 theme-font font-semibold">{priceTrackDetails.source}</span>
                        </div>
                        {priceTrackDetails.href && (
                            <button
                                onClick={handleExternalLinkClick}
                                className="ml-4 inline-flex items-center text-sky-600 hover:text-sky-800 transition-colors duration-200"
                                title="View product page"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span className="text-xs font-medium">View Product</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Product Image */}
                <div className="product-image-container ml-6 flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                        {priceTrackDetails.img ? (
                            <img 
                                src={priceTrackDetails.img} 
                                alt={formattedInfo.displayName} 
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                onError={handleImageError}
                            />
                        ) : null}
                        <div className={`${priceTrackDetails.img ? 'hidden' : ''} w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Price Section */}
            <div className="current-price-section bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Current Price</p>
                        <p className="text-2xl font-bold theme-font">
                            {formattedInfo.displayPrice}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-600 mb-1">Tracking Frequency</p>
                        <p className="text-sm text-gray-800 font-medium">
                            {formattedInfo.iterationInfo}
                        </p>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="details-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Created Date */}
                <div className="detail-item bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">Created</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{formattedInfo.formattedCreatedDate}</p>
                </div>

                {/* Last Checked */}
                <div className="detail-item bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">Last Checked</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{formattedInfo.formattedLastChecked}</p>
                </div>

                {/* Scrape Code */}
                <div className="detail-item bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">Scrape Code</span>
                    </div>
                    <p className="text-xs text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded truncate">
                        {priceTrackDetails.scrapeCode || 'N/A'}
                    </p>
                </div>

                {/* Request ID */}
                <div className="detail-item bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">Request ID</span>
                    </div>
                    <p className="text-xs text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded truncate">
                        {priceTrackDetails.scrapeRequestId || 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
});

PriceTrackInfo.displayName = 'PriceTrackInfo';