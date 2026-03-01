import { AnimatePresence, m } from "framer-motion";
import useNotification from "../../hooks/useNotification";
import { useState, useEffect } from "react";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";

const Notification = () => {
  const { notifications, removeNotification } = useNotification();

  const [notificationToShow, setNotificationToShow] = useState([]);

  useEffect(() => {
    setNotificationToShow(notifications);
  }, [notifications]);

  const styleType = {
    success: { bg: "bg-green-900/75", iconBg: "bg-emerald-600", icon: <IoMdCheckmark /> },
    error: { bg: "bg-red-900/75", iconBg: "bg-rose-600", icon: <IoMdClose /> },
  };

  const whiteTheme = ["/register", "/login"].includes(location.pathname);

  return (
    <>
      <AnimatePresence mode="wait">
        {notificationToShow.length > 0 && (
          <m.div
            key={notificationToShow[notificationToShow.length - 1].id}
            onClick={() => removeNotification(notificationToShow[notificationToShow.length - 1].id)}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="relative z-100"
          >
            <div className="w-full fixed top-0 p-4">
              <div
                className={`max-w-3xl ${styleType[notificationToShow[notificationToShow.length - 1].type].bg} mx-auto cursor-pointer shadow-md flex relative overflow-hidden items-center gap-x-2.5 w-full h-16 p-3 rounded-lg backdrop-blur-2xl border border-white/50`}
              >
                <figure className={`relative text-white ${styleType[notificationToShow[notificationToShow.length - 1].type].iconBg} text-2xl flex items-center justify-center w-9 h-9 rounded-full`}>
                  {styleType[notificationToShow[notificationToShow.length - 1].type].icon || ""}
                </figure>
                <section className="flex-1 truncate">
                  <p className="truncate font-medium">{notificationToShow[notificationToShow.length - 1].desc ?? ""}</p>
                </section>

                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  onAnimationComplete={() => removeNotification(notificationToShow[notificationToShow.length - 1].id)}
                  transition={{ duration: 3, ease: "linear" }}
                  className={`w-full absolute bottom-0 h-[2px] ${whiteTheme ? "bg-black" : "bg-invert"} bottom-0 left-0`}
                ></m.div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Notification;
