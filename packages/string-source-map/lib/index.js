"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringSourceMap = void 0;
const util_1 = require("./util");
const diff_1 = require("diff");
const sync_1 = __importDefault(require("./sync"));
const bluebird_1 = __importDefault(require("bluebird"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const merge_1 = __importDefault(require("lodash/merge"));
const SymHidden = Symbol('prop');
class StringSourceMap {
    constructor(options, ...argv) {
        this[_a] = {};
        this._constructor(options, ...argv);
    }
    _reset() {
        Object.keys(this[SymHidden])
            .forEach(key => {
            if (key.startsWith('_tmp_')) {
                this[SymHidden][key] = null;
            }
        });
    }
    _constructor(options, ...argv) {
        options = util_1.handleInputOptions({
            ...options,
        });
        let { source, target } = options;
        delete options.source;
        delete options.target;
        this[SymHidden].options = merge_1.default(this[SymHidden].options, options);
        if (source != null) {
            this.source = source;
        }
        if (target != null) {
            this.target = target;
        }
        this._reset();
        let _temp = this.sourceFile;
        return this;
    }
    get source() {
        return this[SymHidden].source;
    }
    set source(value) {
        this[SymHidden].source = util_1.handleInputString(value, this[SymHidden].options);
    }
    get locked() {
        return this[SymHidden] && this[SymHidden].locked;
    }
    get target() {
        return this[SymHidden].target;
    }
    set target(value) {
        this[SymHidden].target = util_1.handleInputString(value, this[SymHidden].options);
    }
    get sourcemap() {
        if (this[SymHidden].sourcemap == null && this.locked) {
            this[SymHidden].sourcemap = util_1.generateMagicStringMap(this[SymHidden].ms, this[SymHidden].options);
        }
        return this[SymHidden].sourcemap;
    }
    /**
     * SourceMapConsumer
     *
     * @returns {SourceMapConsumer}
     */
    get smc() {
        if (this[SymHidden].smc == null && this.locked) {
            this[SymHidden].smc = sync_1.default(this.sourcemap);
        }
        return this[SymHidden].smc;
    }
    /**
     * 來源檔案名稱
     */
    get sourceFile() {
        if (this[SymHidden].options.sourceFile == null) {
            this[SymHidden].options.sourceFile = new Date().toISOString();
        }
        return this[SymHidden].options.sourceFile;
    }
    set sourceFile(value) {
        this[SymHidden].options.sourceFile = value.toString();
    }
    /**
     * 目標檔案名稱
     */
    get targetFile() {
        if (this[SymHidden].options.targetFile == null) {
            return this.sourceFile;
        }
        return this[SymHidden].options.targetFile;
    }
    set targetFile(value) {
        this[SymHidden].options.targetFile = value.toString();
    }
    /**
     * 只允許執行一次，執行後會鎖定拒絕更改屬性
     */
    process(options, ...argv) {
        this._constructor(options, ...argv);
        if (this.source == null || this.target == null) {
            throw new TypeError(`source or target is undefined`);
        }
        this[SymHidden].locked = true;
        let { ms, diff } = util_1.diffMagicString(this.source, this.target, this[SymHidden].options);
        this[SymHidden].ms = ms;
        this[SymHidden].diff = diff;
        return this;
    }
    processForce(options, ...argv) {
        this[SymHidden].locked = false;
        return this.process(options, ...argv);
    }
    /**
     * 試圖主動釋放記憶體
     */
    destroy() {
        this._reset();
        // @ts-ignore
        if (this.smc && this.smc.destroy) {
            // @ts-ignore
            this.smc.destroy();
        }
        Object.keys(this[SymHidden])
            .forEach(k => delete this[SymHidden][k]);
        this[SymHidden].locked = true;
        return this;
    }
    fakeThen(cb) {
        return bluebird_1.default
            .resolve(this)
            .bind(this)
            .then(cb);
    }
    /**
     * 從 target 的行列位置來反查在 source 內的原始位置
     */
    originalPositionFor(generatedPosition) {
        return this.smc.originalPositionFor(generatedPosition);
    }
    /**
     * 從 source 內的原始位置來查詢在 target 的行列位置
     */
    generatedPositionFor(originalPosition) {
        if (originalPosition.source == null) {
            originalPosition.source = this.sourceFile;
        }
        return this.smc.generatedPositionFor(originalPosition);
    }
    allGeneratedPositionsFor(originalPosition) {
        if (originalPosition.source == null) {
            originalPosition.source = this.sourceFile;
        }
        return this.smc.allGeneratedPositionsFor(originalPosition);
    }
    toJSON() {
        let { version, file, sources, sourcesContent, mappings, names, } = this.sourcemap;
        return cloneDeep_1.default({
            version: version.toString(),
            file,
            sources,
            sourcesContent,
            mappings,
            names,
        });
    }
    toString() {
        return this.sourcemap.toString();
    }
    /**
     * sourcemap 的 base64 url
     * @returns {string}
     */
    toUrl(includeComment) {
        let url = this.sourcemap.toUrl();
        if (includeComment) {
            url = '//# sourceMappingURL=' + url;
        }
        return url;
    }
    /**
     * 以新內容的位置資訊來查詢原始位置與文字內容
     */
    originalLineFor(generatedPosition) {
        if (!Array.isArray(generatedPosition)) {
            generatedPosition = [generatedPosition];
        }
        let pos = generatedPosition.map(pos => this.originalPositionFor(pos));
        return this.originalLines(pos);
    }
    /**
     * 以原始內容的位置資訊來查詢新位置與文字內容
     */
    generatedLineFor(...argv) {
        let pos = this.generatedPositionFor(...argv);
        return this.generatedLines(pos);
    }
    _splitLines(key) {
        let key_cache = `_tmp_${key}`;
        if (!this[SymHidden][key_cache]) {
            this[SymHidden][key_cache] = util_1.splitLines(this[key]);
        }
        return this[SymHidden][key_cache];
    }
    /**
     * 取得原始字串中的 行列 所在文字內容
     */
    originalLines(position) {
        return util_1.getLineColumn(this._splitLines('source'), position);
    }
    /**
     * 取得新字串中的 行列 所在文字內容
     */
    generatedLines(position) {
        return util_1.getLineColumn(this._splitLines('target'), position);
    }
    createPatch(options = {}) {
        return diff_1.createTwoFilesPatch(this.sourceFile, this.targetFile, this.source, this.target, options.oldHeader, options.newHeader, options.patchOptions);
    }
    computeColumnSpans() {
        this.smc.computeColumnSpans();
        return this;
    }
    eachMapping(callback, context, order) {
        if (typeof context === 'undefined') {
            // @ts-ignore
            context = this;
        }
        this.smc.eachMapping(callback, context, order);
        return this;
    }
    static fromStringWithSourceMap(source, sourceMapConsumer) {
        source = source.toString();
        let self = this;
        if (!(self instanceof StringSourceMap)) {
            self = StringSourceMap;
        }
        let ssm = new self({
            source,
        });
        return ssm;
    }
}
_a = SymHidden;
__decorate([
    CheckLockedMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StringSourceMap.prototype, "_constructor", null);
__decorate([
    CheckLockedProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], StringSourceMap.prototype, "source", null);
__decorate([
    CheckLockedProperty,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], StringSourceMap.prototype, "target", null);
__decorate([
    CheckLockedProperty,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], StringSourceMap.prototype, "sourceFile", null);
__decorate([
    CheckLockedProperty,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], StringSourceMap.prototype, "targetFile", null);
__decorate([
    CheckLockedMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StringSourceMap.prototype, "process", null);
exports.StringSourceMap = StringSourceMap;
function CheckLockedProperty(target, prop, descriptor) {
    const old = descriptor.set;
    // @ts-ignore
    descriptor.set = function (...argv) {
        if (this.locked) {
            throw new ReferenceError(`locked`);
        }
        return old.apply(this, argv);
    };
}
function CheckLockedMethod(target, prop, descriptor) {
    const old = descriptor.value;
    // @ts-ignore
    descriptor.value = function (...argv) {
        if (this.locked) {
            throw new ReferenceError(`locked`);
        }
        return old.apply(this, argv);
    };
    return descriptor;
}
exports.default = StringSourceMap;
//# sourceMappingURL=index.js.map