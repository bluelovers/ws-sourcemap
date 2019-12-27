"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYXJzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1RDtBQUV2RCxTQUFnQixZQUFZLENBQUMsS0FBYTtJQUV6QyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQy9DLENBQUM7QUFIRCxvQ0FHQztBQUVELFNBQWdCLFNBQVMsQ0FBZ0IsS0FBYTtJQUVyRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDekIsQ0FBQztBQUhELDhCQUdDO0FBRUQsU0FBZ0IsV0FBVyxDQUFnQixLQUFhO0lBRXZELE9BQU8sU0FBUyxDQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3pDLENBQUM7QUFIRCxrQ0FHQztBQUVELFNBQWdCLFlBQVksQ0FBZ0IsVUFBa0I7SUFFN0QsSUFBSSxDQUFDLEdBQUcsb0NBQTBCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFL0MsSUFBSSxDQUFDLENBQUMsRUFDTjtRQUNDLE1BQU0sSUFBSSxTQUFTLENBQUMsOEJBQThCLENBQUMsQ0FBQTtLQUNuRDtJQUVELElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXhDLElBQUksSUFBSSxLQUFLLHdCQUF3QixDQUFDLE1BQU0sRUFDNUM7UUFDQyxPQUFPO1lBQ04sSUFBSTtZQUNKLEtBQUssRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFNO1NBQzlCLENBQUM7S0FDRjtJQUVELE9BQU87UUFDTixJQUFJO1FBQ0osSUFBSSxFQUFFLEtBQUs7S0FDWCxDQUFBO0FBQ0YsQ0FBQztBQXZCRCxvQ0F1QkM7QUFFRCxJQUFZLHdCQUlYO0FBSkQsV0FBWSx3QkFBd0I7SUFFbkMsNkVBQU8sQ0FBQTtJQUNQLDJFQUFNLENBQUE7QUFDUCxDQUFDLEVBSlcsd0JBQXdCLEdBQXhCLGdDQUF3QixLQUF4QixnQ0FBd0IsUUFJbkM7QUFFRCxTQUFnQixjQUFjLENBQUMsS0FBYTtJQUUzQyxJQUFJLElBQUksR0FBRyx3QkFBd0IsQ0FBQyxPQUFPLENBQUM7SUFFNUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLG9FQUFvRSxDQUFDLEVBQ3JGO1FBQ0MsS0FBSyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDbEIsSUFBSSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQztLQUN2QztJQUVELE9BQU87UUFDTixJQUFJO1FBQ0osS0FBSztLQUNMLENBQUE7QUFDRixDQUFDO0FBZEQsd0NBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleHRyYWN0U291cmNlTWFwRnJvbVRhcmdldCB9IGZyb20gJy4vZXh0cmFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVCYXNlNjQodmFsdWU6IHN0cmluZylcbntcblx0cmV0dXJuIEJ1ZmZlci5mcm9tKHZhbHVlLCAnYmFzZTY0JykudG9TdHJpbmcoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKU09OPFQgZXh0ZW5kcyBhbnk+KHZhbHVlOiBzdHJpbmcpOiBUXG57XG5cdHJldHVybiBKU09OLnBhcnNlKHZhbHVlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCYXNlNjQ8VCBleHRlbmRzIGFueT4odmFsdWU6IHN0cmluZyk6IFRcbntcblx0cmV0dXJuIHBhcnNlSlNPTjxUPihkZWNvZGVCYXNlNjQodmFsdWUpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb21tZW50PFQgZXh0ZW5kcyBhbnk+KHZhbHVlSW5wdXQ6IHN0cmluZylcbntcblx0bGV0IHMgPSBleHRyYWN0U291cmNlTWFwRnJvbVRhcmdldCh2YWx1ZUlucHV0KTtcblxuXHRpZiAoIXMpXG5cdHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBzb3VyY2VtYXAgY29tbWVudCBub3QgZXhpc3RzYClcblx0fVxuXG5cdGxldCB7IHR5cGUsIHZhbHVlIH0gPSBjaGtDb21tZW50VHlwZShzKTtcblxuXHRpZiAodHlwZSA9PT0gRW51bVNvdXJjZU1hcENvbW1lbnRUeXBlLkJBU0U2NClcblx0e1xuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlLFxuXHRcdFx0dmFsdWU6IHBhcnNlQmFzZTY0KHZhbHVlKSBhcyBULFxuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHR5cGUsXG5cdFx0ZmlsZTogdmFsdWUsXG5cdH1cbn1cblxuZXhwb3J0IGVudW0gRW51bVNvdXJjZU1hcENvbW1lbnRUeXBlXG57XG5cdERFRkFVTFQsXG5cdEJBU0U2NCxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoa0NvbW1lbnRUeXBlKHZhbHVlOiBzdHJpbmcpXG57XG5cdGxldCB0eXBlID0gRW51bVNvdXJjZU1hcENvbW1lbnRUeXBlLkRFRkFVTFQ7XG5cblx0aWYgKHZhbHVlLm1hdGNoKC9eZGF0YTooPzphcHBsaWNhdGlvbnx0ZXh0KVxcL2pzb247KD86Y2hhcnNldFs6PV1cXFMrPzspP2Jhc2U2NCwoLiopJC8pKVxuXHR7XG5cdFx0dmFsdWUgPSBSZWdFeHAuJDE7XG5cdFx0dHlwZSA9IEVudW1Tb3VyY2VNYXBDb21tZW50VHlwZS5CQVNFNjQ7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHR5cGUsXG5cdFx0dmFsdWUsXG5cdH1cbn1cbiJdfQ==