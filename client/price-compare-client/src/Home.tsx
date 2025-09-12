import {SimpleButton} from './components/Buttons';
import { PriceCompare } from './components/PriceCompare';
import { ReactComponent as AppLogo } from './logos/app-logo.svg';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default function Home() {

    return (
        <div id='main-window' className="flex h-screen w-screen flex-col overflow-hidden">
            <Router>
              <div id="main-nav-bar" className="flex flex-row justify-between h-20 border-b border-sky-500 flex-shrink-0">
                  <div id="logo" className="w-20 h-14"> 
                      <AppLogo width="220" height="70"/>
                  </div>
                  <p className="block text-xl font-large font-semibold m-4 text-center theme-font ">Yet Another Compare Tool</p>
                        
                  <div className="items-center justify-self-end">
                    <SimpleButton label="Register" additionalClasses={'m-3'} onClick={() => console.log('Register clicked')} />
                    <SimpleButton label="Sign-In" additionalClasses={'m-3'} onClick={() => console.log('Sign-In clicked')} />
                  </div>
              </div>
              <Routes>
                  <Route path="/" element={<PriceCompare />} />
              </Routes>
            </Router>
        </div>
    );
}