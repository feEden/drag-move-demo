import { isEmpty } from 'lodash';
import { useCallback, useContext } from 'react';

import { CARD_MASK_WRAPPER_ID_NAME } from '../constants';
import { PageChartItemPropsType } from '../types';

import { DATA_TABLE_ID } from '../constants';
import { RheaReactContext } from '../components/provider';

export const useDisplayCardMask = ({ pageKey }) => {
  const { maskInitPositionRef } = useContext(RheaReactContext);

  const getMaskRectPosition = useCallback((selectedChartList) => {
    // 所有图表中 最小的left
    let left = 0;
    let width = 0;
    let height = 0;
    // 所有图表中 最小的top
    let top = 0;
    // 宽度 最大的left + 自身的宽度 - 最小的left
    // 高度 最大的top + 自身的高度 - 最小的top

    selectedChartList.forEach(({ layout: { x, y, w, h } }, index) => {
      if (!index) {
        left = x;
        top = y;
        width = w + x;
        height = h + y;
      } else {
        left = Math.min(left, x);
        top = Math.min(top, y);

        if (x + w > width) {
          width = x + w;
        }

        if (y + h > height) {
          height = y + h;
        }
      }
    });

    return {
      left,
      top,
      width,
      height,
    };
  }, []);

  const onCreatePageChartsMaskDiv = useCallback(
    (ids: string[], chartList: PageChartItemPropsType[]) => {
      let maskCardDom = document.querySelector(
        `#${pageKey} #${CARD_MASK_WRAPPER_ID_NAME}`,
      ) as HTMLDivElement;

      if (!isEmpty(ids) && maskCardDom) {
        const { left, top, width, height } = getMaskRectPosition(
          chartList.filter(({ id }) => ids.includes(id)),
        );
        maskInitPositionRef.current = {
          x: left,
          y: top,
          w: width - left,
          h: height - top,
        };
        maskCardDom.style.cssText += `display: block; left: ${left}px; top: ${top}px;`;
        (maskCardDom.firstChild as HTMLDivElement).style.cssText += `width: ${
          width - left
        }px; height: ${height - top}px`;
      }

      maskCardDom = null;
    },
    [pageKey, getMaskRectPosition],
  );

  const onHideMaskCard = useCallback(() => {
    if (pageKey && pageKey !== DATA_TABLE_ID) {
      let maskCardDom = document.querySelector(
        `#${pageKey} #${CARD_MASK_WRAPPER_ID_NAME}`,
      ) as HTMLDivElement;
      if (maskCardDom) {
        maskCardDom.style.cssText += 'display: none;';
        maskCardDom = null;
      }
    }
  }, [pageKey]);

  return {
    onCreatePageChartsMaskDiv,
    onHideMaskCard,
  };
};
