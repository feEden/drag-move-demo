import { createContext, ReactElement, RefObject, useRef } from "react";
import { LayoutItemType } from "../../types";

interface ProviderType {
    maskInitPositionRef: RefObject<LayoutItemType>;
    isDragingRef?: RefObject<boolean>;
    selectedChartIdsRef: RefObject<string[]>;
}

export const RheaReactContext = createContext<ProviderType>({} as ProviderType);

const RheaReactProvider = ({ children }): ReactElement => {
    const maskInitPositionRef = useRef<LayoutItemType>(null);
    const selectedChartIdsRef = useRef<string[]>([]);
    const isDragingRef = useRef<boolean>(false);

    return (
        <RheaReactContext.Provider
            value={{
                selectedChartIdsRef,
                maskInitPositionRef,
                isDragingRef,
            }}
        >
            {children}
        </RheaReactContext.Provider>
    );
};

export default RheaReactProvider;
