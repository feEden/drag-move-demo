import { useDeepCompareEffect } from "ahooks";
import { SetStateAction } from "jotai";
import { isEmpty } from "lodash";
import { useCallback, useContext, useRef } from "react";

import { PageChartItemPropsType, SetAtom } from "../types";

import { UpdateCardItemProps, useUpdateCardItem } from "./useUpdateCardItem";
import {
  hideLines,
  initLine,
  isRectanglesIntersect,
  moveByDom,
} from "../utils";
import { CARD_MASK_WRAPPER_ID_NAME } from "../constants";
import { RheaReactContext } from "../components/provider";

export type DashboardEditHotKeyProps = {
  isDataEdit: boolean;
  onCreatePageChartsMaskDiv: (
    id: string[],
    chartList: PageChartItemPropsType[]
  ) => void;
  scaleSize: number;
  onReseListenerMouseEventState: () => void;
  setCurPageSelectedChartId?: SetAtom<[SetStateAction<string>], void>;
} & UpdateCardItemProps;

// 监听鼠标位置，在页面上画矩形
const useListenerMouseEvent = ({
  isDataEdit,
  pageKey,
  chartList,
  scaleSize,
  maskInitPositionRef,
  selectedChartIdsRef,
  setPageList,
  onCreatePageChartsMaskDiv,
  onReseListenerMouseEventState,
  setCurPageSelectedChartId,
}: DashboardEditHotKeyProps) => {
  const { isDragingRef } = useContext(RheaReactContext);

  const offsetRef = useRef({ top: 0, left: 0, clientX: 0, clientY: 0 });
  const dragSelectRectDomRef = useRef<HTMLDivElement>(null);
  const mouseStartPositionRef = useRef({
    x: null,
    y: null,
  });
  const mousemoveListenerRef = useRef(null);

  const { onUpdateCardItem, onMouseUpCallback } = useUpdateCardItem({
    setPageList,
    pageKey,
    selectedChartIdsRef,
    chartList,
    maskInitPositionRef,
  });

  const getContainerPosition = useCallback(() => {
    return document.querySelector(`#${pageKey}`)?.getBoundingClientRect();
  }, [pageKey]);

  const getParentRect = useCallback(() => {
    const parentNode = document.querySelector(`#${pageKey}`);
    const { left: l, top: t } = parentNode.getBoundingClientRect();
    return { x: l, y: t };
  }, [pageKey]);

  // 拿到点击的卡片的id
  const getCardSelfId = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const id = target.id;
      if (target.id?.startsWith("chart_")) {
        return id;
      }

      const { x, y } = getParentRect();
      const { clientX, clientY } = e;
      const offsetX = (clientX - x) / scaleSize;
      const offsetY = (clientY - y) / scaleSize;
      let includeNode: PageChartItemPropsType = null;

      // 找到包含这个点的卡片，取zIndex最大的
      chartList.forEach((chart) => {
        const {
          layout: { x, y, w, h },
        } = chart;
        // 在卡片内
        if (
          offsetX >= x &&
          offsetX <= x + w &&
          offsetY >= y &&
          offsetY <= y + h
        ) {
          // 取层级在上面的
          if (includeNode?.zIndex ?? -1 < chart.zIndex) {
            includeNode = chart;
          }
        }
      });
      return includeNode?.id;
    },
    [chartList, getParentRect, scaleSize]
  );

  const onListenerCardMoveMousemove = useCallback(
    (e, { moveDom }) => {
      if (!isDragingRef.current) return;

      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";

      const { left, top, clientX: lastX, clientY: lastY } = offsetRef.current;
      const moveX = e.clientX - lastX;
      const moveY = e.clientY - lastY;
      // 获取dom相对父容器的新位置
      const _left = left + moveX;
      const _top = top + moveY;

      // 都为0 是点击事件
      if (moveX || moveY) {
        moveByDom(
          {
            dom: moveDom,
            top: _top,
            left: _left,
            scaleSize,
            isMultiMove: true,
          },
          (layout) => {
            onUpdateCardItem(layout);
          }
        );
      }
    },
    [scaleSize, onUpdateCardItem]
  );

  const onListenerCardMoveMouseup = useCallback(
    (e) => {
      window.removeEventListener("mousemove", mousemoveListenerRef.current);

      hideLines();
      onMouseUpCallback?.();
      isDragingRef.current = false;
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
      window.removeEventListener("mouseup", onListenerCardMoveMouseup);
    },
    [onMouseUpCallback]
  );

  const onListenerCardMoveMousedown = useCallback(
    (e, { selectedIds }) => {
      const moveDom = document.querySelector(
        `#${pageKey} #${CARD_MASK_WRAPPER_ID_NAME}`
      ) as HTMLDivElement;

      if (!moveDom) {
        return;
      }

      if (isDragingRef.current) {
        return;
      }

      isDragingRef.current = true;
      const parentNode = document.querySelector(`#${pageKey}`);
      // getBoundingClientRect 相对于视口的位置
      const { left, top } = moveDom.getBoundingClientRect();
      const { left: l, top: t } = parentNode.getBoundingClientRect();

      // 保证元素跟随鼠标移动的相对位置正确
      offsetRef.current.top = top - t;
      offsetRef.current.left = left - l;
      offsetRef.current.clientY = e.clientY;
      offsetRef.current.clientX = e.clientX;

      const childs = Array.from(
        parentNode.children as unknown as HTMLElement[]
      ).filter((child) => !selectedIds.includes(child.id));
      initLine(childs, moveDom, scaleSize);
      mousemoveListenerRef.current = (e) =>
        onListenerCardMoveMousemove(e, { moveDom });
      window.addEventListener("mousemove", mousemoveListenerRef.current);
      window.addEventListener("mouseup", onListenerCardMoveMouseup);
    },
    [pageKey, onListenerCardMoveMousemove, onListenerCardMoveMouseup]
  );

  const onListenerMouseBoxSelectMousemove = useCallback(
    (e) => {
      if (!isDragingRef.current) return;

      // 拿到鼠标移动的距离 作为矩形的宽高
      const { x, y } = mouseStartPositionRef.current;
      const diffX = e.clientX - x;
      const diffY = e.clientY - y;

      const width = Math.abs(diffX);
      const height = Math.abs(diffY);
      const rLeft = Math.min(e.clientX, x);
      const rTop = Math.min(e.clientY, y);

      const cssText = `left: ${rLeft}px; top: ${rTop}px; width: ${width}px; height: ${height}px;`;
      if (dragSelectRectDomRef.current) {
        dragSelectRectDomRef.current.style.cssText += cssText;
        document.body.appendChild(dragSelectRectDomRef.current);
      } else {
        // 画矩形
        const div = document.createElement("div");
        div.setAttribute("id", "tmp_drag_select_rect");
        div.style.cssText += `${cssText} position: absolute; border: 1px solid #3b82f6; background: rgba(24, 94, 192, 0.2); z-index: 100000`;
        document.body.appendChild(div);
        dragSelectRectDomRef.current = div;
      }
      const { left: parentOffsetLeft, top: parentOffsetTop } =
        getContainerPosition();

      // 经过的图表需要被选中
      const reatPosition = {
        x: (rLeft - parentOffsetLeft) / scaleSize,
        y: (rTop - parentOffsetTop) / scaleSize,
        w: width / scaleSize,
        h: height / scaleSize,
      };
      let selectedItemIds = selectedChartIdsRef.current;
      // 找到跟矩形🍌的图表
      (chartList as PageChartItemPropsType[]).forEach(({ layout, id }) => {
        if (isRectanglesIntersect(reatPosition, layout)) {
          if (!selectedItemIds.includes(id)) {
            selectedItemIds.push(id);
          }
        } else {
          selectedItemIds = selectedItemIds.filter((item) => item !== id);
        }
      });

      if (!isEmpty(selectedItemIds)) {
        // 创建一个div 覆盖在所有图表上吗
        onCreatePageChartsMaskDiv(selectedItemIds, chartList);
      } else {
        onReseListenerMouseEventState();
      }
      selectedChartIdsRef.current = selectedItemIds;
    },
    [
      chartList,
      scaleSize,
      getContainerPosition,
      onCreatePageChartsMaskDiv,
      onReseListenerMouseEventState,
      isRectanglesIntersect,
    ]
  );

  const onListenerMouseBoxSelectMouseup = useCallback(
    (e) => {
      window.removeEventListener(
        "mousemove",
        onListenerMouseBoxSelectMousemove
      );

      // 点击画布区域 需要取消选中，除卡片自身
      if (selectedChartIdsRef.current?.length) {
        // 如果outsideclick 重置flag
        const container = document.querySelector(`#${pageKey}`);
        // 只接受来自 canvas内的事件
        const targetDom = e.target;
        if (container.contains(targetDom)) {
          if (!getCardSelfId(e) && !dragSelectRectDomRef.current) {
            // 重置多选
            onReseListenerMouseEventState();
          }

          if (selectedChartIdsRef.current.length === 1) {
            setCurPageSelectedChartId(selectedChartIdsRef.current[0]);
          }
        }
      }

      // 移除矩形
      if (dragSelectRectDomRef.current) {
        dragSelectRectDomRef.current.remove();
      }
      isDragingRef.current = false;
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
      mouseStartPositionRef.current = {
        x: null,
        y: null,
      };
      dragSelectRectDomRef.current = null;
      window.removeEventListener("mouseup", onListenerMouseBoxSelectMouseup);
    },
    [
      pageKey,
      getCardSelfId,
      onReseListenerMouseEventState,
      onListenerMouseBoxSelectMousemove,
    ]
  );

  const onListenerMouseBoxSelectMousedown = useCallback(
    (e) => {
      const container = document.querySelector(`#${pageKey}`);
      const targetDom = e.target;

      // 监听来自 canvas 的事件
      if (container?.contains(targetDom)) {
        // 选中单个，可以点击不同卡片切换选中
        const targetDomId = getCardSelfId(e);
        // 点了卡片本身 单选 || 或者点的是没有被选中的卡片
        if (targetDomId) {
          if (!selectedChartIdsRef.current?.includes(targetDomId)) {
            selectedChartIdsRef.current = [targetDomId];
            onCreatePageChartsMaskDiv(selectedChartIdsRef.current, chartList);
          }

          setCurPageSelectedChartId(targetDomId);

          // 处理移动拖拽
          onListenerCardMoveMousedown(e, {
            selectedIds: selectedChartIdsRef.current,
          });
          return;
        }

        // 选中了多个，但是还在选中的卡片触发 不处理
        if (selectedChartIdsRef.current?.includes(targetDomId)) {
          return;
        }

        // 点在canvas 内的其他区域 开始选中操作
        isDragingRef.current = true;
        mouseStartPositionRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";
        window.addEventListener("mousemove", onListenerMouseBoxSelectMousemove);
        window.addEventListener("mouseup", onListenerMouseBoxSelectMouseup);
      }
    },
    [
      pageKey,
      getCardSelfId,
      chartList,
      onListenerCardMoveMousedown,
      onListenerMouseBoxSelectMousemove,
      onListenerMouseBoxSelectMouseup,
    ]
  );

  useDeepCompareEffect(() => {
    if (!isDataEdit && !isEmpty(chartList)) {
      window.addEventListener("mousedown", onListenerMouseBoxSelectMousedown);

      return () => {
        window.removeEventListener(
          "mousedown",
          onListenerMouseBoxSelectMousedown
        );
        window.removeEventListener("mouseup", onListenerMouseBoxSelectMouseup);
        window.removeEventListener(
          "mousemove",
          onListenerMouseBoxSelectMousemove
        );
        window.removeEventListener("mousemove", mousemoveListenerRef.current);
        window.removeEventListener("mouseup", onListenerCardMoveMouseup);

        mousemoveListenerRef.current = null;
      };
    }
  }, [
    isDataEdit,
    chartList,
    onListenerMouseBoxSelectMousemove,
    onListenerMouseBoxSelectMousedown,
    onListenerMouseBoxSelectMouseup,
    onListenerCardMoveMouseup,
  ]);
};

export default useListenerMouseEvent;
