import {lazy, Suspense} from 'react';
import {SimpleButton} from './components/Buttons';
import { ReactComponent as AppLogo } from './logos/app-logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HamburgerMenu } from './components/HamburgerMenu';

const PriceCompare = lazy(() => import('./components/PriceCompare'));
const PriceTrack = lazy(() => import('./components/PriceTrack'));

export default function Home() {

    return (
        <div id='main-window' className="flex h-screen w-screen flex-col overflow-hidden bg-slate-900">
            <Router>
              <div id="main-nav-bar" className="flex flex-row justify-between items-center h-20 border-b border-slate-600 flex-shrink-0 bg-slate-800/50 backdrop-blur-sm">
                  
                  <HamburgerMenu className="mr-4" />
                  <div id="logo" className="w-20 h-14"> 
                      <AppLogo width="220" height="70"/>
                  </div>
                  
                  <div className="flex-1 flex justify-center">
                      <p className="text-xl font-large font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Yet Another Compare Tool</p>
                  </div>
                  
                  <div className="flex items-center">
                      <div className="flex items-center">
                        <SimpleButton label="Register" additionalClasses={'m-3'} onClick={() => console.log('Register clicked')} />
                        <SimpleButton label="Sign-In" additionalClasses={'m-3'} onClick={() => console.log('Sign-In clicked')} />
                      </div>
                  </div>
              </div>
              <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400">Loading...</div>}>
                <Routes>
                    <Route path="/" element={<PriceCompare />} />
                    <Route path="/compare" element={<PriceCompare />} />
                    <Route path="/track" element={<PriceTrack />} /> 
                </Routes>
              </Suspense>
            </Router>
        </div>
    );
}