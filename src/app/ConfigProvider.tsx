'use client'
import {createContext, PropsWithChildren, useContext} from "react";

interface Config {
    baseUrl: string
}

const ConfigContext = createContext<Config | undefined>(undefined);

function ConfigProvider({baseUrl, children}: PropsWithChildren<Config>) {
    return (
        <ConfigContext.Provider value={{baseUrl}}>
            {children}
        </ConfigContext.Provider>
    )
}

function useConfigProvider() {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error("useConfigProvider must be used within the ConfigProvider");
    }
    return context;
}

export { ConfigProvider, useConfigProvider }