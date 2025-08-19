import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import './Notification.css';
import notificationEvents from '../utils/notification';

const NotificationContext = createContext();

export const useNotify = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, options = {}) => {
    const { type = 'info', duration = 5000 } = options;
    const id = uuidv4();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const handleShowNotification = (event) => {
      const { message, options } = event.detail;
      notify(message, options);
    };

    notificationEvents.addEventListener(
      'show_notification',
      handleShowNotification,
    );

    return () => {
      notificationEvents.removeEventListener(
        'show_notification',
        handleShowNotification,
      );
    };
  }, [notify]);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          removeNotification={removeNotification}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification, removeNotification }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id);
    }, notification.duration);

    return () => clearTimeout(timer);
  }, [notification, removeNotification]);

  return (
    <div
      className={`notification notification-${notification.type}`}
      onClick={() => removeNotification(notification.id)}
    >
      {notification.message}
    </div>
  );
};
