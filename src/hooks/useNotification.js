import { v4 as uuid } from "uuid";
import { useNotificationContext } from "../providers/NotificationProvider";

const useNotification = () => {
  const { notifications, setNotifications } = useNotificationContext();

  const addNotification = (notification) => {
    const id = uuid();
    const { desc, type } = notification;
    setNotifications((prev) => [
      {
        id,
        desc,
        type,
      },
      ...prev,
    ]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((msg) => msg.id !== id));
  };

  const removeAllNotification = () => {
    setNotifications([]);
  };

  return { addNotification, removeNotification, removeAllNotification, notifications };
};

export default useNotification;
