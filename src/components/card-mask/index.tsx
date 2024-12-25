import { CSSProperties, FC, useContext } from 'react';

import { UpdateCardItemProps, useUpdateCardItem } from '../../hooks';

import './index.less';
import { RheaReactContext } from '../provider';
import { CARD_MASK_WRAPPER_ID_NAME } from '../../constants';
import CardResize from '../card-resize';

type Props = Omit<UpdateCardItemProps, 'maskInitPositionRef' | 'selectedChartIdsRef'> & {
  scaleSize?: number;
  style?: CSSProperties;
};
const CardMask: FC<Props> = ({ chartList, setPageList, pageKey, scaleSize }) => {
  const { maskInitPositionRef, selectedChartIdsRef } = useContext(RheaReactContext);

  const { onUpdateCardResizeItem, onMouseUpCallback } = useUpdateCardItem({
    pageKey,
    chartList,
    setPageList,
    selectedChartIdsRef,
    maskInitPositionRef,
  });

  return (
    <div
      id={CARD_MASK_WRAPPER_ID_NAME}
      className="card-mask-wrapper"
      style={{
        zIndex: chartList.length + 1,
      }}
    >
      <div
        style={{
          width: `${maskInitPositionRef.current?.w}px`,
          height: `${maskInitPositionRef.current?.h}px`,
          zIndex: chartList.length + 2,
        }}
        className="card-mask-item"
      >
        <CardResize
          pageKey={pageKey}
          scaleSize={scaleSize}
          selectedChartIdsRef={selectedChartIdsRef}
          onUpdateCardItem={onUpdateCardResizeItem}
          onMouseUpCallback={onMouseUpCallback}
        />
      </div>
    </div>
  );
};

export default CardMask;
