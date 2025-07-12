import {ReactNode, useReducer} from 'react';
import { ReactComponent as AmazonLogo } from './logos/amazon-logo.svg';
import { ReactComponent as EbayLogo } from './logos/ebay-logo.svg';
import { ReactComponent as NewEggLogo } from './logos/newegg-logo.svg';
import { ReactComponent as AliExpressLogo } from './logos/aliexpress-logo.svg';

import TextInput from './components/TextInput';
import Checkbox from "./components/Checkbox";

interface Store {
    id: string;
    label: string;
    logo: ReactNode;
    // coupons: string;
    // cashback: string;
}


const stores: Store[] = [
    { id: 'amazon', label: 'Amazon', logo: <AmazonLogo /> },
    { id: 'newegg', label: 'NewEgg', logo: <NewEggLogo /> },
    { id: 'aliexpress', label: 'AliExpress', logo: <AliExpressLogo /> },
    { id: 'ebay', label: 'eBay', logo: <EbayLogo /> },
];

function reducer(state: any , action: any) {
    console.log('reducer: ' + JSON.stringify(action));
    switch (action.type) {
        case 'SET_SEARCH_BOX_TEXT':
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

export default function PriceCompareHome() {
    const [state, dispatch] = useReducer(reducer, {
        searchBoxText: '',
        checkedSources: []
    });

    return (
        <div>
            <div className="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">

            </div>
        <div className="min-h-screen bg-white font-sans">
            {/* Top Nav */}
            <div className="flex items-center justify-between p-4 border-b">
                <button className="text-lg flex items-center gap-2">
                </button>
                <div className="text-3xl font-logo tracking-wide">
                    <span className="text-red-600">❤</span>
                    Price.com
                </div>
                <div className="flex items-center gap-6">
                    <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg">Add to Edge</button>
                    <button className="text-sm">Register</button>
                    <button className="text-sm">Sign-In</button>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col items-center py-12">
                <p className="text-xl font-medium mb-4">Maximize Your Savings</p>
                <div className="flex items-center w-full max-w-xl border-2 border-red-600 rounded-full px-4 py-2">
                    <input
                        type="text"
                        placeholder="Search Stores Online"
                        className="flex-1 outline-none text-lg"
                    />
                </div>
            </div>

            {/* Store Icons */}
            <div className="flex justify-center flex-wrap gap-6 py-10">

                {stores.map((store, i) => (
                    <div onClick={() => dispatch({ type: 'TOGGLE_SEARCH_RESOURCES', payload: store.id })} key={i} className="flex flex-col items-center w-28 text-center cursor-pointer">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-white">
                            {store.logo}
                        </div>
                        <div className="mt-2 text-sm font-medium">{store.id}</div>
                        <Checkbox
                            label="Search"
                            checked={state.checkedSources.includes(store.id)}
                            onChange={() => dispatch({ type: 'TOGGLE_SEARCH_RESOURCES', payload: store.id })}
                            nameId={store.id}
                        />
                        {/*<div className="text-xs text-red-600">{store.coupons}</div>*/}
                        {/*<div className="text-xs text-red-600">{store.cashback}</div>*/}
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
}

function getColor(name: string) {
    switch (name) {
        case "Trip": return "#1969ff";
        case "Priceline": return "#007aff";
        case "Nike": return "#000";
        case "Uber": return "#111";
        case "Dell": return "#0a84ff";
        case "B": return "#0047ab";
        case "W": return "#007dc6";
        case "V": return "#8bc34a";
        default: return "#888";
    }
}