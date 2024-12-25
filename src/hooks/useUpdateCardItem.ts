import { isEmpty } from "lodash";
import { RefObject, useCallback, useEffect, useRef } from "react";
import { LayoutItemType, PageChartItemPropsType } from "../types";

export type UpdateCardItemProps = {
  pageKey: string;
  setPageList: (param: any) => void;
  selectedChartIdsRef: RefObject<string[]>;
  chartList: PageChartItemPropsType[];
  maskInitPositionRef: RefObject<LayoutItemType>;
};
export const useUpdateCardItem = ({
  setPageList,
  pageKey,
  selectedChartIdsRef,
  chartList,
  maskInitPositionRef,
}: UpdateCardItemProps) => {
  const updateChartListRef = useRef<Record<string, LayoutItemType>>({});
  const maskTmpPositionRef = useRef<LayoutItemType>(null);

  const onUpdateChartListLayout = useCallback(
    (updated: Record<string, LayoutItemType>) => {
      const newList = [...chartList];
      Object.keys(updated).forEach((idx) => {
        newList[idx].layout = updated[idx];
      });
      setPageList(newList);
    },
    [pageKey, chartList]
  );

  const onMouseUpCallback = useCallback(() => {
    const udpateLayoutMap = updateChartListRef.current;
    if (!isEmpty(udpateLayoutMap)) {
      onUpdateChartListLayout(udpateLayoutMap);
      maskInitPositionRef.current = maskTmpPositionRef.current;
    }
    updateChartListRef.current = {};
    maskTmpPositionRef.current = null;
  }, [onUpdateChartListLayout]);

  const getUpdateLayout = useCallback(
    (initLayout: LayoutItemType, newLayout: LayoutItemType) => {
      const { x: initLeft, y: initTop, w: initW, h: initH } = initLayout;
      const { w: updatedW, h: updatedH, x: updatedX, y: updatedY } = newLayout;
      const changedW = updatedW - initW;
      const changedH = updatedH - initH;
      const changedLeft = updatedX - initLeft;
      const changedTop = updatedY - initTop;

      return {
        changedW,
        changedH,
        changedLeft,
        changedTop,
      };
    },
    []
  );

  const onUpdateCardResizeItem = useCallback(
    (value: LayoutItemType) => {
      const { changedLeft, changedTop } = getUpdateLayout(
        maskInitPositionRef.current,
        value
      );
      const { w: newW, h: newH } = value;
      const scaleX = newW / maskInitPositionRef.current.w;
      const scaleY = newH / maskInitPositionRef.current.h;
      const isChangedOriginalPosition = changedLeft !== 0 || changedTop !== 0;

      // 让选中的图表 跟着动
      selectedChartIdsRef.current.forEach((id) => {
        const dom = document.getElementById(id);
        if (dom) {
          const index = chartList.findIndex((item) => item.id === id);
          if (index > -1) {
            const {
              layout: { x, y, w, h },
            } = chartList[index];
            const newP = {
              x: x,
              y: y,
              w: w * scaleX,
              h: h * scaleY,
            };

            const calcPosition = isChangedOriginalPosition
              ? value
              : maskInitPositionRef.current;
            newP.x =
              calcPosition.x + (x - maskInitPositionRef.current.x) * scaleX;
            newP.y =
              calcPosition.y + (y - maskInitPositionRef.current.y) * scaleY;
            dom.style.cssText += `left: ${newP.x}px;top: ${newP.y}px;width: ${newP.w}px;height: ${newP.h}px`;
            updateChartListRef.current[index] = newP;
          }
        }
      });
      maskTmpPositionRef.current = value;
    },
    [getUpdateLayout, chartList]
  );

  // 点击的是card 移动的是mask
  const onUpdateCardItem = useCallback(
    (value) => {
      const { changedLeft, changedTop } = getUpdateLayout(
        maskInitPositionRef.current,
        value
      );

      // 让选中的图表 跟着动
      selectedChartIdsRef.current.forEach((id) => {
        const dom = document.getElementById(id);
        if (dom) {
          const index = chartList.findIndex((item) => item.id === id);
          if (index > -1) {
            const {
              layout: { x, y, w, h },
            } = chartList[index];
            let updateX = x + changedLeft;
            let updateY = y + changedTop;
            const newP = {
              x: updateX,
              y: updateY,
            };
            dom.style.cssText += `left: ${updateX}px;top: ${updateY}px;`;
            updateChartListRef.current[index] = {
              ...newP,
              w,
              h,
            };
          }
        }
      });

      maskTmpPositionRef.current = value;
    },
    [getUpdateLayout, chartList]
  );

  return {
    onUpdateCardItem,
    onUpdateCardResizeItem,
    onMouseUpCallback,
  };
};
