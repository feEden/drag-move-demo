// 两个矩形相交的条件是它们在 水平 和 垂直 方向上都有重叠部分：
// 水平方向：一个矩形的右边界大于另一个矩形的左边界，同时它的左边界小于另一个矩形的右边界。

import { nanoid } from "nanoid";

// 垂直方向：一个矩形的下边界大于另一个矩形的上边界，同时它的上边界小于另一个矩形的下边界。
export const isRectanglesIntersect = (rectA: any, rectB: any) => {
  // 获取两个矩形的边界
  const aLeft = rectA.x;
  const aRight = rectA.x + rectA.w;
  const aTop = rectA.y;
  const aBottom = rectA.y + rectA.h;

  const bLeft = rectB.x;
  const bRight = rectB.x + rectB.w;
  const bTop = rectB.y;
  const bBottom = rectB.y + rectB.h;

  // 判断是否相交
  const isHorizontalOverlap = aRight > bLeft && aLeft < bRight;
  const isVerticalOverlap = aBottom > bTop && aTop < bBottom;

  // 如果水平和垂直方向都有重叠，则相交
  return isHorizontalOverlap && isVerticalOverlap;
};

export const getIsMacPlatform = () =>
  navigator.userAgent.indexOf("Mac OS") >= 0;

export const getUuid = (length = 8): string => {
  if (window.crypto && window.crypto.getRandomValues) {
    return nanoid(length);
  }

  return Math.random()
    .toString(16)
    .slice(2, 2 + length);
};

type Value = number | string;

export function toFloat(v: Value, d = 2, strict = false): Value {
  const num = Number(v);
  return isNaN(num) ? '-' : strict ? num.toFixed(d) : Number(num.toFixed(d));
}


export * from "./view-line";
