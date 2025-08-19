import React, { ReactNode, useState, useReducer } from "react";
import { ReactComponent as SearchButton } from '../logos/search-button.svg';
import { ReactComponent as AmazonLogo } from '../logos/amazon-logo.svg';
import { ReactComponent as EbayLogo } from '../logos/ebay-logo.svg';
import { ReactComponent as NewEggLogo } from '../logos/newegg-logo.svg';
import { ReactComponent as AliExpressLogo } from '../logos/aliexpress-logo.svg';
import { sendSearchRequest } from "src/services/api";
import TextInput from "./TextInput";


interface Props {
  onSearch: (query: string, sources: string[]) => void;
}

interface CheckedSource {
    name: string;
    order: number;
  }

interface ScrapeSourceOption {
    name: string;
    label: string;
    order: number,
    logo: ReactNode;
}

const stores: ScrapeSourceOption[] = [
    { name: 'amazon', label: 'Amazon', order: 1, logo: <AmazonLogo /> },
    { name: 'newegg', label: 'NewEgg', order: 2, logo: <NewEggLogo /> },
    { name: 'aliexpress', label: 'AliExpress', order: 3, logo: <AliExpressLogo /> },
    { name: 'ebay', label: 'eBay', order: 4, logo: <EbayLogo /> },
    { name: 'banggood', label: 'Banggood', order: 5, logo: <EbayLogo /> },
];

function reducer(state: any , action: any) {
    // console.log('reducer: ' + JSON.stringify(action));
    switch (action.type) {
        case 'SET_SEARCH_BOX_TEXT':
            return { ...state, searchBoxText: action.payload };
        case 'TOGGLE_SEARCH_RESOURCES': {
            const sourceId = action.payload.name;

            const sourceExists = state.checkedSources.some((source: CheckedSource) => source.name === sourceId);

            let checkedSources = state.checkedSources;
            
            if (sourceExists) {
                // Remove the source if it exists
                checkedSources = state.checkedSources.filter((source: CheckedSource) => source.name !== sourceId);
            } else if (state.checkedSources.length < 4) {
                // Only add if we have less than 4 sources already
                checkedSources = [...state.checkedSources, { name: sourceId, order: action.payload.order }];
            }
                console.log(checkedSources);
            return { ...state, checkedSources };
        }

        default:
            return state;
    }
}

export const SearchBar: React.FC<Props> = ({ onSearch }) => {
    const [state, dispatch] = useReducer(reducer, {
        searchBoxText: '',
        checkedSources: [],
    });

    // console.log('SearchBar state: ' + JSON.stringify(state));
    const handleSendSearchRequest = async () => {
        const res = await sendSearchRequest(process.env.REACT_APP_TMP_USER_ID || '', state.searchBoxText.trim(), state.checkedSources)
    };

    const handleChangeSearchInput = async (value: string) => {
        dispatch({ type: 'SET_SEARCH_BOX_TEXT', payload: value })
    };
    
    
    return (
        <div id="search-form" className="flex flex-col bg-black-700 w-full theme-border">
            <div className="flex flex-row justify-between items-center">
                <div id="search-bar" className="flex flex-row h-12 items-center w-3/6 h-18 mt-5 mb-5 mr-auto ml-auto theme-input-frame rounded-2xl">
                    <TextInput className={""} placeholder="Search Stores Online" onChange={handleChangeSearchInput} />
                    <div className="w-5 mr-5"><SearchButton className="cursor-pointer" onClick={handleSendSearchRequest} /></div>
                </div>
            </div>
            <div id="scrape-source-bar" className="flex flex-row justify-center m-4">
                {stores.map((store, i) => (
                    <div onClick={() => dispatch({ type: 'TOGGLE_SEARCH_RESOURCES', payload: {name: store.name, order: store.order} })} key={i} style={{ opacity: state.checkedSources.some((source: CheckedSource) => source.name === store.name) ? 1 : 0.3 }} className={`flex flex-col items-center bg-gray-500 m-4 w-28 text-center item-borders cursor-pointer`}>
                        <div className="w-16 h-24 rounded-full flex items-center justify-center text-xl font-bold theme-font">
                            {store.logo}
                        </div>
                        <p className="theme-font">{store.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
  };