"use strict";
/**
 * Created by user on 2019/12/27.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm92ZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJub3ZlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7O0FBRUgsK0JBQXlDO0FBQ3pDLDREQUFnQztBQUVoQyxNQUFhLFNBQVUsU0FBUSxXQUFJO0lBRWxDLFFBQVEsQ0FBQyxLQUFhO1FBRXJCLE9BQU8sb0JBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ2hDLENBQUM7Q0FDRDtBQU5ELDhCQU1DO0FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUVsQyxTQUFnQixjQUFjLENBQUMsTUFBYyxFQUFFLE1BQWMsRUFBRSxPQUFxQjtJQUVuRixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUMvQyxDQUFDO0FBSEQsd0NBR0M7QUFFRCxrQkFBZSxjQUFjLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzEyLzI3LlxuICovXG5cbmltcG9ydCB7IERpZmYsIEJhc2VPcHRpb25zIH0gZnJvbSAnZGlmZic7XG5pbXBvcnQgVVN0cmluZyBmcm9tICd1bmktc3RyaW5nJ1xuXG5leHBvcnQgY2xhc3MgRGlmZk5vdmVsIGV4dGVuZHMgRGlmZlxue1xuXHR0b2tlbml6ZSh2YWx1ZTogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIFVTdHJpbmcuc3BsaXQodmFsdWUsICcnKVxuXHR9XG59XG5cbmNvbnN0IG5vdmVsRGlmZiA9IG5ldyBEaWZmTm92ZWwoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZOb3ZlbENoYXJzKG9sZFN0cjogc3RyaW5nLCBuZXdTdHI6IHN0cmluZywgb3B0aW9ucz86IEJhc2VPcHRpb25zKVxue1xuXHRyZXR1cm4gbm92ZWxEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpZmZOb3ZlbENoYXJzXG4iXX0=