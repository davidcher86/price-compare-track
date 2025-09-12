import React from 'react';

export const PriceTrack: React.FC = () => {
    return (
        <div id="content-component" className="flex flex-row flex-1 min-h-0">
            <div id="search-bar"  className="flex flex-col w-1/5 h-full pl-3 gap-3 theme-border overflow-hidden items-center">
                <p className="text-xl font-normal text-center theme-font h-10 pt-5 pb-3">{"scheduled tracking prices".toUpperCase()}</p>
                <div className="overflow-auto">   
                    {/* {historicalData.map((item) => <SearchHistoryItem key={item.key} item={item} selectedHistoryItem={selectedHistoryItem} handleSelectedItem={handleSelectedItem} handleDeleteScrape={handleDeleteScrape} />)} */}
                </div>
            </div>
            
            <div id="search-scrape-result-content"  className="flex flex-col w-4/5 flex-1 min-h-0">
            
                <div id="scrape-bar-header" className="flex flex-col w-full mt-2 h-20 justify-center flex-shrink-0">
                    <p className="block text-xl font-medium text-center theme-font">Track Item prices online stores - Maximize Your Savings</p>
                </div>
                
                <div className="flex-shrink-0">
                    {/* <SearchBar /> */}
                </div>
                
                <div className="flex-1 min-h-0">
                    {/* <SearchResults resultData={scrapeDataResult}/> */}
                </div>
            </div>
        </div>
    );
};
