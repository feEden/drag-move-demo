import { useSetAtom } from 'jotai';
import { isEmpty } from 'lodash';
import { useCallback, useContext, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { getIsMacPlatform } from '../utils';

import { useDisplayCardMask } from './useDispalyCardMask';
import useListenerMouseEvent, { DashboardEditHotKeyProps } from './useListenerMouseEvent';
import { RheaReactContext } from '../components/provider';
import { curPageSelectedChartIdAtom } from '../atoms';

export const useDashboardEditHotKey = ({
  setPageList,
  chartList,
  pageKey,
  isDataEdit,
  scaleSize,
  setCurPageSelectedChartId,
}: Omit<
  DashboardEditHotKeyProps,
  | 'onReseListenerMouseEventState'
  | 'selectedChartIdsRef'
  | 'maskInitPositionRef'
  | 'onCreatePageChartsMaskDiv'
  | 'setSettingType'
>) => {
  const { selectedChartIdsRef, maskInitPositionRef } = useContext(RheaReactContext);
  const curPageSelectedChartId = useSetAtom(curPageSelectedChartIdAtom);
  const isMacPlatform = getIsMacPlatform();

  const { onCreatePageChartsMaskDiv, onHideMaskCard } = useDisplayCardMask({
    pageKey,
  });

  const onReseListenerMouseEventState = useCallback(() => {
    onHideMaskCard();

    curPageSelectedChartId('');
    selectedChartIdsRef.current = [];
    maskInitPositionRef.current = null;
  }, [onHideMaskCard]);

  useListenerMouseEvent({
    isDataEdit,
    pageKey,
    chartList,
    scaleSize,
    maskInitPositionRef,
    selectedChartIdsRef,
    setCurPageSelectedChartId,
    setPageList,
    onCreatePageChartsMaskDiv,
    onReseListenerMouseEventState,
  });

  // 图表全选
  useHotkeys(`${isMacPlatform ? 'meta' : 'ctrl'}+a`, (e) => {
    e.preventDefault();
    if (!isDataEdit) {
      const allIds = chartList?.map(({ id }) => id) || [];
      if (isEmpty(allIds)) {
        return;
      }

      selectedChartIdsRef.current = allIds;
      // 创建一个div 覆盖在所有图表上吗
      onCreatePageChartsMaskDiv(allIds, chartList);
    }
  });

  useHotkeys('backspace', (e) => {
    e.preventDefault();
    const selectedIds = selectedChartIdsRef.current ?? [];
    // 批量删除
    selectedIds.forEach((id) => {
      const index = chartList.findIndex((item) => item.id === id);
      if (index !== -1) {
        chartList.splice(index, 1);
      }
    });
    setPageList([...chartList]);
    onReseListenerMouseEventState();
  });

  useEffect(() => {
    return () => {
      onReseListenerMouseEventState();
    };
  }, []);

  return {
    onReseListenerMouseEventState,
  };
};
