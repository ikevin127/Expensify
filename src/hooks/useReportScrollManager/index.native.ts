import {useCallback, useContext} from 'react';
import {ActionListContext} from '@pages/home/ReportScreenContext';
import type ReportScrollManagerData from './types';

function useReportScrollManager(): ReportScrollManagerData {
    const {flatListRef, setScrollPosition} = useContext(ActionListContext);

    /**
     * Scroll to the provided index.
     */
    const scrollToIndex = (index: number, isEditing = false, viewPosition = 0) => {
        if (!flatListRef?.current || isEditing) {
            return;
        }

        flatListRef.current.scrollToIndex({index, viewPosition});
    };

    /**
     * Scroll to the bottom of the flatlist.
     */
    const scrollToBottom = useCallback(() => {
        if (!flatListRef?.current) {
            return;
        }

        setScrollPosition({offset: 0});

        flatListRef.current?.scrollToOffset({animated: false, offset: 0});
    }, [flatListRef, setScrollPosition]);

    return {ref: flatListRef, scrollToIndex, scrollToBottom};
}

export default useReportScrollManager;
