"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSourceMapConsumerSync = void 0;
const source_map_1 = require("source-map");
function createSourceMapConsumerSync(sourcemap) {
    return new source_map_1.SourceMapConsumer(sourcemap);
}
exports.createSourceMapConsumerSync = createSourceMapConsumerSync;
exports.default = createSourceMapConsumerSync;
//# sourceMappingURL=sync.js.map