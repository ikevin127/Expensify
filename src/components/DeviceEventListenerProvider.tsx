import React, { useEffect, useRef, createContext, useContext, useCallback, useMemo } from 'react';
import { DeviceEventEmitter } from 'react-native';

// Define types for the callback arguments
type UnreadActionCallback = (newLastReadTime: string) => void;
type DeletedReportActionCallback = (reportActionID: string) => void;

// Define the structure of the context
type DeviceEventListenerContextProps = {
    subscribeToUnreadAction: (reportID: string, callback: UnreadActionCallback) => void;
    subscribeToReadNewestAction: (reportID: string, callback: UnreadActionCallback) => void;
    subscribeToDeletedReportAction: (reportID: string, callback: DeletedReportActionCallback) => void;
    unsubscribeFromUnreadAction: (reportID: string) => void;
    unsubscribeFromReadNewestAction: (reportID: string) => void;
    unsubscribeFromDeletedReportAction: (reportID: string) => void;
}

// Create the context
const DeviceEventListenerContext = createContext<DeviceEventListenerContextProps | undefined>(undefined);

// Define the provider props and state/interface for storing current listeners
type DeviceEventListenerProviderProps = {
    children: React.ReactNode;
};

type ListenerMap = Record<string, Array<ReturnType<typeof DeviceEventEmitter.addListener>>>;

// Create the provider component
function DeviceEventListenerProvider({ children }: DeviceEventListenerProviderProps) {
    const listenersRef = useRef<ListenerMap>({});

    // Define a method to add a listener for a specific report
    const addListener = useCallback((eventType: string, listener: (...args: unknown[]) => void) => {
        const subscription = DeviceEventEmitter.addListener(eventType, listener);
        const reportID = eventType.split('_')?.[1];

        if (!listenersRef.current[reportID]) {
            listenersRef.current[reportID] = [];
        }

        listenersRef.current[reportID].push(subscription);
        return subscription;
    }, []);

    // Helper function to remove a single listener and update the ref map.
    const removeListener = useCallback((eventType: string) => {
        const listener = listenersRef.current[eventType];
        if (listener) {
            listener.forEach((subscription) => subscription.remove());
            delete listenersRef.current[eventType]; // This removes the listener reference from the map
        }
    }, []);

    // Define a method to remove all listeners for a specific report
    const removeListenersForReport = useCallback((reportID: string) => {
        listenersRef.current[reportID]?.forEach((subscription) => subscription.remove());
        delete listenersRef.current[reportID];
    }, []);

    useEffect(() => {
        const currentListeners = listenersRef.current;
        // Cleanup all listeners on unmount (app-level)
        return () => Object.keys(currentListeners).forEach(removeListenersForReport);
    }, [removeListenersForReport]);

    const subscribeToUnreadAction = useCallback((reportID: string, callback: UnreadActionCallback) => {
        addListener(`unreadAction_${reportID}`, (...args: unknown[]) => callback(args[0] as string));
    }, [addListener]);

    const subscribeToReadNewestAction = useCallback((reportID: string, callback: UnreadActionCallback) => {
        addListener(`readNewestAction_${reportID}`, (...args: unknown[]) => callback(args[0] as string));
    }, [addListener]);

    const subscribeToDeletedReportAction = useCallback((reportID: string, callback: DeletedReportActionCallback) => {
        addListener(`deletedReportAction_${reportID}`, (...args: unknown[]) => callback(args[0] as string));
    }, [addListener]);

    const unsubscribeFromUnreadAction = useCallback((reportID: string) => removeListener(`unreadAction_${reportID}`), [removeListener]);
    const unsubscribeFromReadNewestAction = useCallback((reportID: string) => removeListener(`readNewestAction_${reportID}`), [removeListener]);
    const unsubscribeFromDeletedReportAction = useCallback((reportID: string) => removeListener(`deletedReportAction_${reportID}`), [removeListener]);

    const contextValue = useMemo(
        () => ({
            subscribeToUnreadAction,
            subscribeToReadNewestAction,
            subscribeToDeletedReportAction,
            unsubscribeFromUnreadAction,
            unsubscribeFromReadNewestAction,
            unsubscribeFromDeletedReportAction,
        }),
        [
            subscribeToUnreadAction,
            subscribeToReadNewestAction,
            subscribeToDeletedReportAction,
            unsubscribeFromUnreadAction,
            unsubscribeFromReadNewestAction,
            unsubscribeFromDeletedReportAction
        ]
    );

    // Provide the context
    return (
        <DeviceEventListenerContext.Provider value={contextValue}>
            {children}
        </DeviceEventListenerContext.Provider>
    );
};

// The custom hook to use the context
const useDeviceEventListeners = () => {
    const context = useContext(DeviceEventListenerContext);
    if (context === undefined) {
        throw new Error('useUnreadMarkers must be used within a UnreadMarkersProvider');
    }
    return context;
};

export {
    DeviceEventListenerProvider,
    useDeviceEventListeners,
};
