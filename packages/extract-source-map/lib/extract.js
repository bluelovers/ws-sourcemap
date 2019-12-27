"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @deprecated
 */
var EnumExtractSourceMapType;
(function (EnumExtractSourceMapType) {
    EnumExtractSourceMapType[EnumExtractSourceMapType["JS"] = 1] = "JS";
    EnumExtractSourceMapType[EnumExtractSourceMapType["CSS"] = 2] = "CSS";
})(EnumExtractSourceMapType || (EnumExtractSourceMapType = {}));
function extractSourceMapFromTargetAllCore(value) {
    let lastMatchs = [];
    [
        /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)/mg,
        /(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg,
    ].some(re => {
        if (re) {
            let match;
            re.lastIndex = 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cmFjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4dHJhY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNILElBQUssd0JBSUo7QUFKRCxXQUFLLHdCQUF3QjtJQUU1QixtRUFBVyxDQUFBO0lBQ1gscUVBQVksQ0FBQTtBQUNiLENBQUMsRUFKSSx3QkFBd0IsS0FBeEIsd0JBQXdCLFFBSTVCO0FBRUQsU0FBZ0IsaUNBQWlDLENBQUMsS0FBYTtJQUU5RCxJQUFJLFVBQVUsR0FBc0IsRUFBRSxDQUFDO0lBRXZDO1FBQ0Msc0RBQXNEO1FBQ3RELG9FQUFvRTtLQUNwRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUdYLElBQUksRUFBRSxFQUNOO1lBQ0MsSUFBSSxLQUFzQixDQUFDO1lBRTNCLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBRWpCLE9BQU8sS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBZSxDQUFDLEVBQ3ZDO2dCQUNDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDdEI7WUFFRCxPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUE7U0FDeEI7SUFDRixDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sVUFBVSxDQUFDO0FBQ25CLENBQUM7QUExQkQsOEVBMEJDO0FBRUQsU0FBZ0IsNkJBQTZCLENBQUMsS0FBYTtJQUUxRCxPQUFPLGlDQUFpQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFIRCxzRUFHQztBQUVELFNBQWdCLDBCQUEwQixDQUFDLEtBQWE7SUFFdkQsT0FBTyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuRCxDQUFDO0FBSEQsZ0VBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmVudW0gRW51bUV4dHJhY3RTb3VyY2VNYXBUeXBlXG57XG5cdEpTID0gMHgwMDAxLFxuXHRDU1MgPSAweDAwMDIsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U291cmNlTWFwRnJvbVRhcmdldEFsbENvcmUodmFsdWU6IHN0cmluZylcbntcblx0bGV0IGxhc3RNYXRjaHM6IFJlZ0V4cEV4ZWNBcnJheVtdID0gW107XG5cblx0W1xuXHRcdC8oPzpcXC9cXC9bQCNdW1xcc10qc291cmNlTWFwcGluZ1VSTD0oW15cXHMnXCJdKylbXFxzXSokKS9tZyxcblx0XHQvKD86XFwvXFwqW0AjXVtcXHNdKnNvdXJjZU1hcHBpbmdVUkw9KFteXFxzKidcIl0rKVtcXHNdKig/OlxcKlxcLylbXFxzXSokKS9tZyxcblx0XS5zb21lKHJlID0+XG5cdHtcblxuXHRcdGlmIChyZSlcblx0XHR7XG5cdFx0XHRsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheTtcblxuXHRcdFx0cmUubGFzdEluZGV4ID0gMDtcblxuXHRcdFx0d2hpbGUgKG1hdGNoID0gcmUuZXhlYyh2YWx1ZSBhcyBzdHJpbmcpKVxuXHRcdFx0e1xuXHRcdFx0XHRsYXN0TWF0Y2hzLnB1c2gobWF0Y2gpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsYXN0TWF0Y2hzLmxlbmd0aFxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIGxhc3RNYXRjaHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U291cmNlTWFwRnJvbVRhcmdldEFsbCh2YWx1ZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gZXh0cmFjdFNvdXJjZU1hcEZyb21UYXJnZXRBbGxDb3JlKHZhbHVlKS5tYXAobSA9PiBtWzFdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTb3VyY2VNYXBGcm9tVGFyZ2V0KHZhbHVlOiBzdHJpbmcpXG57XG5cdHJldHVybiBleHRyYWN0U291cmNlTWFwRnJvbVRhcmdldEFsbCh2YWx1ZSkucG9wKCk7XG59XG4iXX0=