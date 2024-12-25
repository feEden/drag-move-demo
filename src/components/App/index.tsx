import { useEffect, useState } from 'react';
import { PageChartItemPropsType } from '../../types';
import RheaReactProvider from '../provider';
import { getUuid } from '../../utils';
import CardMask from '../card-mask';
import { useDashboardEditHotKey } from '../../hooks/useDashboardEditHotKey';

// const BG_COLOR_SET = ['slate', 'sky', 'pink', 'red', 'orange', 'purple', 'amber', 'yellow', 'lime', 'rose'];
// // 随机返回一个颜色
// const randomColor = () => {
//   return BG_COLOR_SET[Math.floor(Math.random() * BG_COLOR_SET.length)];
// };
const pageKey = '_pageKey_';
const App = () => {
  const [list, setList] = useState<PageChartItemPropsType[]>([]);
  const [_, setCurPageSelectedChartId] = useState<string>('');

  const { onReseListenerMouseEventState } = useDashboardEditHotKey({
    chartList: list,
    pageKey,
    isDataEdit: false,
    scaleSize: 1,
    setPageList: setList,
    setCurPageSelectedChartId,
  });

  useEffect(() => {
    return () => {
      onReseListenerMouseEventState()
    }
  }, []);

  return (
    <>
      <div className='w-[80px] h-full border-r border-solid border-slate-400 flex justify-center'>
        <button onClick={() => {
          setList((pre) => [...pre, {
            id: `chart_${getUuid()}`,
            label: getUuid(),
            zIndex: pre.length + 1,
            layout: {
              w: 500,
              h: 300,
              x: 0,
              y: 0
            }
          }]);
        }} className='h-[32px] text-gray-700 px-[16px] rounded-[4px] mt-[8px] text-[16px] border border-slate-500'>add</button>
      </div>
      <div className='flex-1 h-full relative p-[16px]' id={pageKey}>
        {
          list.map(({ label, layout, id }) => (
            <div key={id} id={id} style={{
              left: `${layout.x}px`,
              top: `${layout.y}px`,
              width: `${layout.w}px`,
              height: `${layout.h}px`,
            }} className='bg-sky-200 rounded-[4px] flex justify-center items-center absolute cursor-move overflow-hidden border border-purple-500'>
              {label}
            </div>
          ))
        }
        <CardMask
          setPageList={setList}
          chartList={list}
          pageKey={pageKey}
          scaleSize={1}
        />
      </div>
    </>
  );
};

export default () => <RheaReactProvider>
  <App />
</RheaReactProvider>;
