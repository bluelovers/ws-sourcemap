"use strict";
/**
 * Created by user on 2019/12/27.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffNovelChars = exports.DiffNovel = void 0;
const diff_1 = require("diff");
const uni_string_1 = __importDefault(require("uni-string"));
class DiffNovel extends diff_1.Diff {
    tokenize(value) {
        return uni_string_1.default.split(value, '');
    }
}
exports.DiffNovel = DiffNovel;
const novelDiff = new DiffNovel();
function diffNovelChars(oldStr, newStr, options) {
    return novelDiff.diff(oldStr, newStr, options);
}
exports.diffNovelChars = diffNovelChars;
exports.default = diffNovelChars;
//# sourceMappingURL=novel.js.map