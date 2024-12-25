import { initLine } from './lines/store';
import { hideLines, moveByDom } from './move';
import { hideLines as hideResizeLines, resizeByDom } from './resize';

import './index.less';

export { moveByDom, resizeByDom, initLine, hideLines, hideResizeLines };
