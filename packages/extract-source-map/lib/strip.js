"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdHJpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOztHQUVHO0FBQ0gsbUNBQTZFO0FBRTdFLFNBQWdCLHFCQUFxQixDQUFDLEtBQWE7SUFFbEQsT0FBTyxLQUFLO1NBQ1YsT0FBTyxDQUFDLGdDQUF3QixFQUFFLEVBQUUsQ0FBQztTQUNyQyxPQUFPLENBQUMsZ0NBQXdCLEVBQUUsRUFBRSxDQUFDLENBQ3RDO0FBQ0YsQ0FBQztBQU5ELHNEQU1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS8xMi8yOC5cbiAqL1xuaW1wb3J0IHsgUkVfU09VUkNFX01BUF9DT01NRU5UXzAyLCBSRV9TT1VSQ0VfTUFQX0NPTU1FTlRfMDEgfSBmcm9tICcuL2NvbnN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwU291cmNlTWFwQ29tbWVudChpbnB1dDogc3RyaW5nKVxue1xuXHRyZXR1cm4gaW5wdXRcblx0XHQucmVwbGFjZShSRV9TT1VSQ0VfTUFQX0NPTU1FTlRfMDEsICcnKVxuXHRcdC5yZXBsYWNlKFJFX1NPVVJDRV9NQVBfQ09NTUVOVF8wMiwgJycpXG5cdDtcbn1cbiJdfQ==