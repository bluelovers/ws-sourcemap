"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSourceMapFromTarget = exports.extractSourceMapFromTargetAll = exports.extractSourceMapFromTargetAllCore = void 0;
/**
 * @deprecated
 */
const const_1 = require("./const");
var EnumExtractSourceMapType;
(function (EnumExtractSourceMapType) {
    EnumExtractSourceMapType[EnumExtractSourceMapType["JS"] = 1] = "JS";
    EnumExtractSourceMapType[EnumExtractSourceMapType["CSS"] = 2] = "CSS";
})(EnumExtractSourceMapType || (EnumExtractSourceMapType = {}));
function extractSourceMapFromTargetAllCore(value) {
    let lastMatchs = [];
    [
        new RegExp(const_1.RE_SOURCE_MAP_COMMENT_01.source, const_1.RE_SOURCE_MAP_COMMENT_01.flags),
        new RegExp(const_1.RE_SOURCE_MAP_COMMENT_02.source, const_1.RE_SOURCE_MAP_COMMENT_02.flags),
    ].some(re => {
        if (re) {
            let match;
            while (match = re.exec(value)) {
                lastMatchs.push(match);
            }
            return lastMatchs.length;
        }
    });
    return lastMatchs;
}
exports.extractSourceMapFromTargetAllCore = extractSourceMapFromTargetAllCore;
function extractSourceMapFromTargetAll(value) {
    return extractSourceMapFromTargetAllCore(value).map(m => m[1]);
}
exports.extractSourceMapFromTargetAll = extractSourceMapFromTargetAll;
function extractSourceMapFromTarget(value) {
    return extractSourceMapFromTargetAll(value).pop();
}
exports.extractSourceMapFromTarget = extractSourceMapFromTarget;
//# sourceMappingURL=extract.js.map