/**
 * NotificationContext — shares dashboard alert data globally.
 * Dashboard fetches stats and calls setAlerts(); Navbar reads alerts.
 */
import { createContext, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [alerts, setAlerts] = useState([]);
    return (
        <NotificationContext.Provider value={{ alerts, setAlerts }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
    return ctx;
}
