"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazySourceMap = void 0;
const get_source_map_comment_1 = require("get-source-map-comment");
const util_1 = require("./util");
class LazySourceMap {
    constructor(properties, callback) {
        let { version, sources = [], sourcesContent = [], names = [], mappings, file, sourceRoot } = util_1._toRawSourceMapJSON(properties, callback);
        this.version = version | 0;
        this.sources = sources;
        this.mappings = mappings;
        this.names = names;
        this.file = file;
        this.sourceRoot = sourceRoot;
        this.sourcesContent = sourcesContent;
    }
    /**
     * when sourceMappingURL is file path, need use callback for handle it
     */
    static fromContext(input, callback) {
        let data = get_source_map_comment_1.parseComment(input);
        let { value } = data;
        if (data.type !== get_source_map_comment_1.EnumSourceMapCommentType.BASE64) {
            value = callback(data.file);
        }
        return new this(value);
    }
    static fromBase64(value) {
        return new this(Buffer.from(value, 'base64').toString());
    }
    static from(value) {
        return new this(value);
    }
    toJSON() {
        let { version, sources, sourcesContent, names, mappings, file, sourceRoot } = this;
        return {
            version,
            sources,
            names,
            mappings,
            file,
            sourceRoot,
            sourcesContent,
        };
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toBase64() {
        return Buffer.from(this.toString()).toString('base64');
    }
    toUrl() {
        return `data:application/json;base64,${this.toBase64()}`;
    }
    toComment({ multiline, flag, } = {}) {
        let prefix = flag ? '@' : '#';
        let value = `${prefix} sourceMappingURL=${this.toUrl()}`;
        if (multiline) {
            return `/*${value} */`;
        }
        return `//${value}`;
    }
}
exports.LazySourceMap = LazySourceMap;
//# sourceMappingURL=index.js.map