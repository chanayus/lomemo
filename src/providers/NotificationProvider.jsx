import { createContext, useContext, useState } from "react";

const NotificationContext = createContext({
  notifications: [],
  setNotifications: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  return <NotificationContext.Provider value={{ notifications, setNotifications }}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  return context;
};

export { NotificationContext };
