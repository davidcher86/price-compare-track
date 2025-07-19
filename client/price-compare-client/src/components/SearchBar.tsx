import React, { ReactNode, useState, useReducer } from "react";
import Checkbox from "./Checkbox";
import { ReactComponent as AmazonLogo } from '../logos/amazon-logo.svg';
import { ReactComponent as EbayLogo } from '../logos/ebay-logo.svg';
import { ReactComponent as NewEggLogo } from '../logos/newegg-logo.svg';
import { ReactComponent as AliExpressLogo } from '../logos/aliexpress-logo.svg';
import { sendSearchRequest } from "src/services/api";
import TextInput from "./TextInput";


interface Props {
  onSearch: (query: string, sources: string[]) => void;
}

interface ScrapeSourceOption {
    id: string;
    label: string;
    logo: ReactNode;
}

const stores: ScrapeSourceOption[] = [
    { id: 'amazon', label: 'Amazon', logo: <AmazonLogo /> },
    { id: 'newegg', label: 'NewEgg', logo: <NewEggLogo /> },
    { id: 'aliexpress', label: 'AliExpress', logo: <AliExpressLogo /> },
    { id: 'ebay', label: 'eBay', logo: <EbayLogo /> },
];

function reducer(state: any , action: any) {
    console.log('reducer: ' + JSON.stringify(action));
    switch (action.type) {
        case 'SET_SEARCH_BOX_TEXT':
            console.log('set search box text: ' + action.payload);
            return { ...state, searchBoxText: action.payload };
        case 'TOGGLE_SEARCH_RESOURCES':
            console.log('payload: ' + JSON.stringify(action.payload));
            const checkedSources = state.checkedSources.includes(action.payload)
                ? state.checkedSources.filter((source: string) => source !== action.payload)
                : [...state.checkedSources, action.payload];
            console.log('state: ' + JSON.stringify({ checkedSources }));
            return { ...state, checkedSources };

        default:
            return state;
    }

    return state;
}

export const SearchBar: React.FC<Props> = ({ onSearch }) => {
    const [state, dispatch] = useReducer(reducer, {
        searchBoxText: '',
        checkedSources: []
    });

    console.log('SearchBar state: ' + JSON.stringify(state));
    const handleSendSearchRequest = async () => {
        const res = await sendSearchRequest('8c62a416-504d-4b82-87f6-94a536aa27da', state.searchBoxText.trim(), state.checkedSources)
    };

    const handleChangeSearchInput = async (value: string) => {
        dispatch({ type: 'SET_SEARCH_BOX_TEXT', payload: value })
    };
    
    return (
        <div id="search-form" className="flex flex-col bg-black-700 w-full rem-100 border-b border-sky-500">
            <div id="search-bar" className="flex h-12 items-center w-3/6 mt-10 mb-10 mr-auto ml-auto m-4 border-2 border-red-600 rounded-full p-2">
                <TextInput placeholder="Search Stores Online" onChange={handleChangeSearchInput} />
                {/* <input
                    type="text"
                    placeholder="Search Stores Online"
                    className="flex-1 outline-none text-lg" /> */}
            </div>

            <button onClick={handleSendSearchRequest} className="p-4 text-sm">Search</button>

            <div id="scrape-source-bar" className="flex flex-row justify-center ">
                {stores.map((store, i) => (
                    <div onClick={() => dispatch({ type: 'TOGGLE_SEARCH_RESOURCES', payload: store.id })} key={i} className="flex flex-col items-center w-28 text-center cursor-pointer">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white">
                            {store.logo}
                        </div>
                        <div className="mt-2 text-sm font-medium">{store.id}</div>
                            <Checkbox
                                checked={state.checkedSources.includes(store.id)}
                                onChange={() => dispatch({ type: 'TOGGLE_SEARCH_RESOURCES', payload: store.id })}
                                nameId={store.id} />
                    </div>
                ))}
            </div>
        </div>
    //   <div className="flex gap-2 mb-4">
    //     <input
    //       className="border p-2 w-full rounded"
    //       type="text"
    //       placeholder="Search..."
    //       value={query}
    //       onChange={(e) => setQuery(e.target.value)}
    //     />
    //     <button
    //       className="bg-blue-500 text-white px-4 rounded"
    //       onClick={handleSearch}
    //     >
    //       Search
    //     </button>
    //   </div>
    );
  };