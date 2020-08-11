"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripSourceMapComment = exports.EnumSourceMapCommentType = exports.chkCommentType = exports.parseComment = exports.extractSourceMapFromTarget = void 0;
const extract_1 = require("./extract");
Object.defineProperty(exports, "extractSourceMapFromTarget", { enumerable: true, get: function () { return extract_1.extractSourceMapFromTarget; } });
const parse_1 = require("./parse");
Object.defineProperty(exports, "parseComment", { enumerable: true, get: function () { return parse_1.parseComment; } });
Object.defineProperty(exports, "chkCommentType", { enumerable: true, get: function () { return parse_1.chkCommentType; } });
Object.defineProperty(exports, "EnumSourceMapCommentType", { enumerable: true, get: function () { return parse_1.EnumSourceMapCommentType; } });
const strip_1 = require("./strip");
Object.defineProperty(exports, "stripSourceMapComment", { enumerable: true, get: function () { return strip_1.stripSourceMapComment; } });
exports.default = extract_1.extractSourceMapFromTarget;
//# sourceMappingURL=index.js.map