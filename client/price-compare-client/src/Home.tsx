import {SimpleButton} from './components/Buttons';
import { PriceCompare } from './components/PriceCompare';
import { PriceTrack } from './components/PriceTrack';
import { ReactComponent as AppLogo } from './logos/app-logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HamburgerMenu } from './components/HamburgerMenu';

export default function Home() {

    return (
        <div id='main-window' className="flex h-screen w-screen flex-col overflow-hidden">
            <Router>
              <div id="main-nav-bar" className="flex flex-row justify-between items-center h-20 border-b border-sky-500 flex-shrink-0">
                  
                  <HamburgerMenu className="mr-4" />
                  <div id="logo" className="w-20 h-14"> 
                      <AppLogo width="220" height="70"/>
                  </div>
                  
                  <div className="flex-1 flex justify-center">
                      <p className="text-xl font-large font-semibold text-center theme-font">Yet Another Compare Tool</p>
                  </div>
                  
                  <div className="flex items-center">
                      <div className="flex items-center">
                        <SimpleButton label="Register" additionalClasses={'m-3'} onClick={() => console.log('Register clicked')} />
                        <SimpleButton label="Sign-In" additionalClasses={'m-3'} onClick={() => console.log('Sign-In clicked')} />
                      </div>
                  </div>
              </div>
              <Routes>
                  <Route path="/" element={<PriceCompare />} />
                  <Route path="/compare" element={<PriceCompare />} />
                  <Route path="/track" element={<PriceTrack />} />
              </Routes>
            </Router>
        </div>
    );
}