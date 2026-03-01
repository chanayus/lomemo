import { AnimatePresence, m } from "motion/react";
import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "../utils/misc";

const ModalContext = createContext({
  modal: null,
  setModal: null,
});

const defaultOption = {
  containerClassName: "",
  backdropClassName: "",
};

const defaultState = {
  element: null,
  option: defaultOption,
};

export const ModalContextProvider = ({ children }) => {
  const [modal, setModal] = useState(defaultState);

  useEffect(() => {
    if (modal.element) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [modal]);

  return (
    <ModalContext.Provider value={{ modal, setModal }}>
      <AnimatePresence mode="wait">
        {modal.element && (
          // Backdrop layer
          <m.div
            onClick={() => setModal(defaultState)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("fixed top-0 left-0 w-full h-full z-50 bg-black/60", {}, modal.option.backdropClassName)}
          >
            {/* Container Layer */}
            <div className={cn("pointer-events-none [&>*]:pointer-events-auto h-full flex justify-center items-center px-5", modal.option.containerClassName)} onClick={(e) => e.stopPropagation()}>
              {modal.element}
            </div>
          </m.div>
        )}
      </AnimatePresence>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);

  const openModal = (content, option = defaultOption) => {
    context.setModal({ element: content, option: { ...defaultOption, ...option } });
  };

  const closeModal = () => {
    context.setModal(defaultState);
  };

  return { openModal, closeModal };
};
