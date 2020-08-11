"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chkCommentType = exports.EnumSourceMapCommentType = exports.parseComment = exports.parseBase64 = exports.parseJSON = exports.decodeBase64 = void 0;
const extract_1 = require("./extract");
function decodeBase64(value) {
    return Buffer.from(value, 'base64').toString();
}
exports.decodeBase64 = decodeBase64;
function parseJSON(value) {
    return JSON.parse(value);
}
exports.parseJSON = parseJSON;
function parseBase64(value) {
    return parseJSON(decodeBase64(value));
}
exports.parseBase64 = parseBase64;
function parseComment(valueInput) {
    let s = extract_1.extractSourceMapFromTarget(valueInput);
    if (!s) {
        throw new TypeError(`sourcemap comment not exists`);
    }
    let { type, value } = chkCommentType(s);
    if (type === EnumSourceMapCommentType.BASE64) {
        return {
            type,
            value: parseBase64(value),
        };
    }
    return {
        type,
        file: value,
    };
}
exports.parseComment = parseComment;
var EnumSourceMapCommentType;
(function (EnumSourceMapCommentType) {
    EnumSourceMapCommentType[EnumSourceMapCommentType["DEFAULT"] = 0] = "DEFAULT";
    EnumSourceMapCommentType[EnumSourceMapCommentType["BASE64"] = 1] = "BASE64";
})(EnumSourceMapCommentType = exports.EnumSourceMapCommentType || (exports.EnumSourceMapCommentType = {}));
function chkCommentType(value) {
    let type = EnumSourceMapCommentType.DEFAULT;
    if (value.match(/^data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(.*)$/)) {
        value = RegExp.$1;
        type = EnumSourceMapCommentType.BASE64;
    }
    return {
        type,
        value,
    };
}
exports.chkCommentType = chkCommentType;
//# sourceMappingURL=parse.js.map