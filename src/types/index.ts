export type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

export enum COMPONENT_TYPES_ENUM {
  NORMAL = 1,
  FILTER,
  WEB,
  IMAGE = 6,
}

export type LayoutItemType = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PageChartItemPropsType = {
  id: string;
  label: string;
  // 组件类型
  componentType?: COMPONENT_TYPES_ENUM;
  // 图表类型
  chartType?: number;
  // 相对位置
  layout?: LayoutItemType;
  // 层级
  zIndex?: number;
  // 每个图对应的配置（线宽、颜色等）
  chartSetting?: Record<string, unknown>;
  // 用了哪个数据源
  workSheetId?: string;
  // 可视化配置
  visualCfg?: Record<string, unknown[]>;
  // 是否在边框内
  // isInner?: boolean;
  missFields?: string[];
};

export type PageItemPropsType = {
  key: string;
  isHide?: boolean;
  pageSetting?: Record<string, unknown>;
  pageCharts?: PageChartItemPropsType[];
};
