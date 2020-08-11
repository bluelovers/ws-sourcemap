"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripSourceMapComment = void 0;
/**
 * Created by user on 2019/12/28.
 */
const const_1 = require("./const");
function stripSourceMapComment(input) {
    return input
        .replace(const_1.RE_SOURCE_MAP_COMMENT_01, '')
        .replace(const_1.RE_SOURCE_MAP_COMMENT_02, '');
}
exports.stripSourceMapComment = stripSourceMapComment;
//# sourceMappingURL=strip.js.map