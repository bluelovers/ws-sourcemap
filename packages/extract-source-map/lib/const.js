"use strict";
/**
 * Created by user on 2019/12/28.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RE_SOURCE_MAP_COMMENT_02 = exports.RE_SOURCE_MAP_COMMENT_01 = void 0;
exports.RE_SOURCE_MAP_COMMENT_01 = /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)/mg;
exports.RE_SOURCE_MAP_COMMENT_02 = /(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
//# sourceMappingURL=const.js.map