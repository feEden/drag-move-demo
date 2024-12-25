import { FC, RefObject, useCallback, useContext, useEffect, useRef } from 'react';

import './index.less';
import { RheaReactContext } from '../provider';
import { hideResizeLines, initLine, resizeByDom } from '../../utils';
import { CARD_MASK_WRAPPER_ID_NAME } from '../../constants';

type CardResizePropsType = {
  pageKey?: string;
  scaleSize?: number;
  onMouseUpCallback?: () => void;
  selectedChartIdsRef?: RefObject<string[]>;
  onUpdateCardItem?: (value: unknown) => void;
};
const CardResize: FC<CardResizePropsType> = ({
  pageKey,
  scaleSize,
  onMouseUpCallback,
  onUpdateCardItem,
  selectedChartIdsRef,
}) => {
  const { isDragingRef } = useContext(RheaReactContext);
  const doucmentMousemoveListenerRef = useRef(null);
  const offsetPositionRef = useRef<{
    event: {
      x?: number;
      y?: number;
    }
    w?: number;
    h?: number;
    moveLastBoundingClientRect?: DOMRect;
  }>(null);

  const documentMouseupListener = useCallback(
    (e) => {
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';

      offsetPositionRef.current = null;
      isDragingRef.current = false;

      hideResizeLines();
      onMouseUpCallback?.();
      document.removeEventListener('mousemove', doucmentMousemoveListenerRef.current);
    },
    [onMouseUpCallback],
  );

  const doucmentMousemoveListener = useCallback(
    (e, { type, moveDom, parentRect }) => {
      e.stopPropagation();
      if (!isDragingRef.current) {
        return;
      }

      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';

      const { event: {
        x, y
      }, w, h, moveLastBoundingClientRect } = offsetPositionRef.current;
      const { left: moveDomLastLeft, top: moveDomLastTop } = moveLastBoundingClientRect;
      // const moveDomRight = moveDomLastLeft + w;
      // const moveDomBottom = moveDomLastTop + h;

      const { x: parentRectX, y: parentRectY } = parentRect;
      const dx = e.clientX - x;
      const dy = e.clientY - y;

      // let left = moveDomLastLeft - parentRectX,
      //   top = moveDomLastTop - parentRectY,
      //   width = w,
      //   height = h;
      let left,
        top,
        width,
        height;
      switch (type) {
        case 'bc':
          width = w;
          height = h + dy;
          left = moveDomLastLeft - parentRectX;
          top = (height > 0 ? moveDomLastTop : moveDomLastTop + height) - parentRectY;
          break;
        case 'tc':
          width = w;
          height = h - dy;
          left = moveDomLastLeft - parentRectX;
          // <= 0 时，top 固定为初始的bottom
          top = (height > 0 ? e.clientY : h + moveDomLastTop) - parentRectY;
          break;
        case 'lc':
          height = h;
          width = w - dx;
          top = moveDomLastTop - parentRectY;
          left = (width > 0 ? e.clientX : w + moveDomLastLeft) - parentRectX;
          break;
        case 'rc':
          height = h;
          width = w + dx;
          top = moveDomLastTop - parentRectY;
          left = (width > 0 ? moveDomLastLeft : moveDomLastLeft + width) - parentRectX;
          break;
        case 'br':
          width = w + dx;
          height = h + dy;
          left = (width > 0 ? moveDomLastLeft : moveDomLastLeft + width) - parentRectX;
          top = (height > 0 ? moveDomLastTop : moveDomLastTop + height) - parentRectY;
          break;
        case 'bl':
          width = w - dx;
          height = h + dy;
          left = (width > 0 ? e.clientX : w + moveDomLastLeft) - parentRectX
          top = (height > 0 ? moveDomLastTop : moveDomLastTop + height) - parentRectY;
          break;
        case 'tl':
          width = w - dx;
          height = h - dy;
          left = (width > 0 ? e.clientX : w + moveDomLastLeft) - parentRectX
          top = (height > 0 ? e.clientY : h + moveDomLastTop) - parentRectY;
          break;
        case 'tr':
          width = w + dx;
          height = h - dy;
          left = (width > 0 ? moveDomLastLeft : moveDomLastLeft + width) - parentRectX;
          top = (height > 0 ? e.clientY : h + moveDomLastTop) - parentRectY;
          break;
      }

      resizeByDom({ dom: moveDom, top: top, left: left, height: Math.abs(height), width: Math.abs(width), scaleSize }, (layout) => {
        onUpdateCardItem(layout);
      });
    },
    [scaleSize, onUpdateCardItem],
  );

  const onmousedownListener = useCallback(
    (e) => {
      e.stopPropagation();

      if (isDragingRef.current) {
        return;
      }

      isDragingRef.current = true;

      const moveDom = document.querySelector(
        `#${pageKey} #${CARD_MASK_WRAPPER_ID_NAME}`,
      ) as HTMLDivElement;
      const container = document.querySelector(`#${pageKey}`) as HTMLDivElement;
      const childs = Array.from(container.children).filter(
        (child) => !selectedChartIdsRef.current.includes(child.id),
      ) as HTMLElement[];
      initLine(childs, moveDom, scaleSize);

      const parentRect = container.getBoundingClientRect();
      const type = e.target.className;
      const moveLastBoundingClientRect = (moveDom as HTMLDivElement).getBoundingClientRect();
      const { offsetWidth, offsetHeight } = moveDom.firstChild as HTMLElement;
      offsetPositionRef.current = {
        event: {
          x: e.clientX,
          y: e.clientY,
        },
        w: offsetWidth,
        h: offsetHeight,
        moveLastBoundingClientRect,
      };
      doucmentMousemoveListenerRef.current = (e) =>
        doucmentMousemoveListener(e, {
          type,
          parentRect,
          moveDom,
        });
      document.addEventListener('mousemove', doucmentMousemoveListenerRef.current);
      document.addEventListener('mouseup', documentMouseupListener);
    },
    [pageKey, scaleSize, doucmentMousemoveListener, documentMouseupListener],
  );

  useEffect(() => {
    return () => {
      document.removeEventListener('mouseup', documentMouseupListener);
      document.removeEventListener('mousemove', doucmentMousemoveListenerRef.current);
    };
  }, [documentMouseupListener]);

  return (
    <>
      {['tl', 'tr', 'bl', 'br', 'tc', 'bc', 'lc', 'rc'].map((cls) => (
        <i className={cls} key={cls} onMouseDown={onmousedownListener}></i>
      ))}
    </>
  );
};

export default CardResize;
