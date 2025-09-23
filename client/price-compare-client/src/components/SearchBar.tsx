import React, { ReactNode, useRef, useReducer, useEffect, useCallback } from "react";
import { ReactComponent as SearchButton } from '../logos/search-button.svg';
import { ReactComponent as AmazonLogo } from '../logos/amazon-logo.svg';
import { ReactComponent as EbayLogo } from '../logos/ebay-logo.svg';
import { ReactComponent as NewEggLogo } from '../logos/newegg-logo.svg';
import { ReactComponent as AliExpressLogo } from '../logos/aliexpress-logo.svg';
import { sendSearchRequest } from "src/services/api";
import { useNotification } from "./Notifications";
import { useLoading } from "./LoadingSpinner";
import TextInput from "./TextInput";


// interface Props {
//   onSearch: (query: string, sources: string[]) => void;
// }

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
        case 'SET_VALID_REQUEST':
            return { ...state, validRequest: action.payload };
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

export const SearchBar: React.FC<any> = () => {
    const { addNotification } = useNotification();
    const { showLoading, hideLoading } = useLoading();
    const showLoadingRef = useRef(showLoading);
    const hideLoadingRef = useRef(hideLoading);
    const addNotificationRef = useRef(addNotification);
    
    // Update refs on each render
    showLoadingRef.current = showLoading;
    hideLoadingRef.current = hideLoading;
    addNotificationRef.current = addNotification;

    const [state, dispatch] = useReducer(reducer, {
        searchBoxText: '',
        checkedSources: [],
        validRequest: false
    });

    useEffect(() => {
        const isValid = state.searchBoxText.trim() !== '' && state.checkedSources.length > 0;
        dispatch({ type: 'SET_VALID_REQUEST', payload: isValid });
    }, [state.searchBoxText, state.checkedSources]);

    // const handleSearch = useCallback(async (scrapeRequestId: string) => {
    //         try {
    //             showLoadingRef.current("Retrieving scrape results...");
    //             await retrieveScrapeResultsData(process.env.REACT_APP_TMP_USER_ID || '', scrapeRequestId);
    //             addNotificationRef.current("Search request sent successfully", "success");
    //         } catch (error) {
    //             addNotificationRef.current("Error retrieving scrape results", "error");
    //             console.error('Error retrieving scrape results:', error);
    //         } finally {
    //             hideLoadingRef.current();
    //         }
    //     }, [showLoadingRef, hideLoadingRef, addNotificationRef]);

    const handleSendSearchRequest = async () => {
        try {
            showLoadingRef.current("Sending search request...");
            await sendSearchRequest(process.env.REACT_APP_TMP_USER_ID || '', state.searchBoxText.trim(), state.checkedSources)
            addNotificationRef.current("Search request sent successfully", "success");
        } catch (error) {
            addNotificationRef.current("Error sending search request", "error");
            console.error('Error sending search request:', error);
        } finally {
            hideLoadingRef.current();
        }
    };

    const handleChangeSearchInput = useCallback(async (value: string) => {
        dispatch({ type: 'SET_SEARCH_BOX_TEXT', payload: value })
    }, [dispatch]);


    return (
        <div id="search-form" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex flex-row justify-center items-center mb-6">
                <div id="search-bar" className="flex flex-row items-center w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
                    <TextInput 
                        className="flex-1 px-6 py-4 text-lg placeholder-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none" 
                        placeholder="Search stores online for the best deals..." 
                        onChange={handleChangeSearchInput} 
                    />
                    <button 
                        className={`mr-4 p-3 rounded-xl transition-all duration-200 ${
                            state.validRequest 
                                ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 active:scale-95 cursor-pointer' 
                                : 'text-gray-300 cursor-not-allowed'
                        }`}
                        onClick={handleSendSearchRequest}
                        disabled={!state.validRequest}
                        aria-label="Search"
                    >
                        <SearchButton className="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            <div id="scrape-source-bar" className="grid grid-cols-5 gap-4">
                {stores.map((store, i) => (
                    <button
                        key={i}
                        onClick={() => dispatch({ type: 'TOGGLE_SEARCH_RESOURCES', payload: {name: store.name, order: store.order} })}
                        className={`
                            flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 
                            hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-100
                            ${state.checkedSources.some((source: CheckedSource) => source.name === store.name)
                                ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-md' 
                                : 'bg-white border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-80'
                            }
                        `}
                        aria-pressed={state.checkedSources.some((source: CheckedSource) => source.name === store.name)}
                    >
                        <div className="w-12 h-12 flex items-center justify-center mb-2">
                            {store.logo}
                        </div>
                        <span className={`text-sm font-medium ${
                            state.checkedSources.some((source: CheckedSource) => source.name === store.name)
                                ? 'text-gray-900' 
                                : 'text-gray-600'
                        }`}>
                            {store.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
  };