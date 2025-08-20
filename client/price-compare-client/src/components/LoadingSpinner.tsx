import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoadingSpinnerContextType {
  showLoading: (text?: string) => void;
  hideLoading: () => void;
}

const LoadingSpinnerContext = createContext<LoadingSpinnerContextType | undefined>(undefined);

export const useLoading = (): LoadingSpinnerContextType => {
  const context = useContext(LoadingSpinnerContext);
  if (!context) {
    throw new Error("useLoading must be used inside a LoadingProvider");
  }
  return context;
};

interface LoadingSpinnerProviderProps {
  children: ReactNode;
}

export const LoadingSpinnerProvider: React.FC<LoadingSpinnerProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const showLoading = (text?: string) => {
    if (text) setLoadingText(text);
    setIsVisible(true);
  };

  const hideLoading = () => {
    setIsVisible(false);
  };

  return (
    <LoadingSpinnerContext.Provider value={{ showLoading, hideLoading }}>
      {children}
    
    {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="relative w-36 h-36">
            {/* Spinner wheel */}
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

            {/* Text inside */}
            <span className="absolute inset-0 flex items-center justify-center text-base font-semibold text-white">
              {loadingText}
            </span>
          </div>
        </div>
      )}
    </LoadingSpinnerContext.Provider>
  );
};

export default LoadingSpinnerProvider;
