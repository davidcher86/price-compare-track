import React, { useRef, useEffect, createContext, useContext, useState } from "react";
import ReactDOM from "react-dom";

interface YesNoModalProps {
  isOpen: boolean;
  title?: string;
  content?: any;
  message?: string;
  onYes: (item: any) => void;
  onNo: () => void;
}

interface ModalContextType {
  isOpen: boolean;
  openModal: (props: Omit<YesNoModalProps, 'isOpen'>) => void;
  closeModal: () => void;
}

const PopUpContext = createContext<ModalContextType | undefined>(undefined);

export const usePopUp = () => {
  const context = useContext(PopUpContext);
  if (!context) {
    throw new Error("usePopUp must be used within PopUpProvider");
  }
  return context;
};

export const PopUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<any>(undefined);
  const [title, setTitle] = useState("Confirm Action");
  const [message, setMessage] = useState("Are you sure you want to continue?");
  const [onYes, setOnYes] = useState<(item: any) => void>(() => () => {});
  const [onNo, setOnNo] = useState<() => void>(() => () => {});

  const openModal = (props: Omit<YesNoModalProps, 'isOpen'>) => {
    setIsOpen(true);
    setContent(props.content);
    setTitle(props.title || "Confirm Action");
    setMessage(props.message || "Are you sure you want to continue?");
    setOnYes(() => props.onYes);
    setOnNo(() => props.onNo || (() => setIsOpen(false)));
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleNo = () => {
    onNo();
    closeModal();
  };

  const handleYes = (item: any) => {
    onYes(item);
    closeModal();
  };

  return (
    <PopUpContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleNo}
          />

          {/* Modal Box */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 z-10 w-96">
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

            {/* Message */}
            {content ? content : <p className="mt-2 text-gray-600">{message}</p>}

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleNo}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={handleYes}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </PopUpContext.Provider>
  );
};

export const YesNoModal: React.FC<YesNoModalProps> = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  onYes,
  onNo,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onNo(); // treat outside click as "No"
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onNo]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onNo}
      />

      {/* Modal Box */}
      <div ref={modalRef} className="relative bg-white rounded-2xl shadow-lg p-6 z-10 w-96">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

        {/* Message */}
        <p className="mt-2 text-gray-600">{message}</p>

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onNo}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            No
          </button>
          <button
            onClick={onYes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};