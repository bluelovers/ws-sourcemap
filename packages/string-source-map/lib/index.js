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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FLZ0I7QUFFaEIsK0JBQThGO0FBUzlGLGtEQUFpRDtBQUVqRCx3REFBZ0M7QUFDaEMsaUVBQXlDO0FBQ3pDLHlEQUFpQztBQUVqQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFRakMsTUFBYSxlQUFlO0lBZ0IzQixZQUFZLE9BQWlDLEVBQUUsR0FBRyxJQUFJO1FBZDVDLFFBQVcsR0FZakIsRUFBUyxDQUFDO1FBSWIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRVMsTUFBTTtRQUVmLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNkLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDM0I7Z0JBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQzthQUM1QjtRQUNGLENBQUMsQ0FBQyxDQUNGO0lBQ0YsQ0FBQztJQUdTLFlBQVksQ0FBQyxPQUFnQyxFQUFFLEdBQUcsSUFBSTtRQUUvRCxPQUFPLEdBQUcseUJBQWtCLENBQUM7WUFDNUIsR0FBRyxPQUFPO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFakMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3RCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxHQUFHLGVBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8s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Q2Y7WUFDQyxNQUFNLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQ2xDO1FBRUQsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBZ0IsTUFBVyxFQUFFLElBQW9CLEVBQUUsVUFBc0M7SUFFbEgsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztJQUM3QixhQUFhO0lBQ2IsVUFBVSxDQUFDLEtBQUssR0FBRyxVQUFpQyxHQUFHLElBQUk7UUFFMUQsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUNmO1lBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUNsQztRQUVELE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQyxDQUFDO0lBRUYsT0FBTyxVQUFVLENBQUE7QUFDbEIsQ0FBQztBQUVELGtCQUFlLGVBQWUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdElHZW5lcmF0ZVN0cmluZ1NvdXJjZU1hcE9wdGlvbnMsXG5cdGhhbmRsZUlucHV0T3B0aW9ucyxcblx0aGFuZGxlSW5wdXRTdHJpbmcsXG5cdGdlbmVyYXRlU3RyaW5nU291cmNlTWFwLCBkaWZmTWFnaWNTdHJpbmcsIGdlbmVyYXRlTWFnaWNTdHJpbmdNYXAsIGdldExpbmVDb2x1bW4sIHNwbGl0TGluZXMsXG59IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgTWFnaWNTdHJpbmcsIHsgU291cmNlTWFwIH0gZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCB7IENoYW5nZSBhcyBKU0RpZmZDaGFuZ2UsIGNyZWF0ZVBhdGNoLCBjcmVhdGVUd29GaWxlc1BhdGNoLCBQYXRjaE9wdGlvbnMgfSBmcm9tICdkaWZmJztcbmltcG9ydCB7XG5cdFNvdXJjZU1hcENvbnN1bWVyLFxuXHRTb3VyY2VGaW5kUG9zaXRpb24sXG5cdEZpbmRQb3NpdGlvbixcblx0UG9zaXRpb24sXG5cdE1hcHBlZFBvc2l0aW9uLFxuXHRSYXdTb3VyY2VNYXAsIE1hcHBpbmdJdGVtLFxufSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCBjcmVhdGVTb3VyY2VNYXBDb25zdW1lclN5bmMgZnJvbSAnLi9zeW5jJztcbmltcG9ydCB7IElUU1Jlc29sdmFibGUsIElUU1BhcnRpYWxXaXRoLCBJVFNQcm9wZXJ0eUtleSwgSVRTVmFsdWVPckFycmF5IH0gZnJvbSAndHMtdHlwZSc7XG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UnO1xuXG5jb25zdCBTeW1IaWRkZW4gPSBTeW1ib2woJ3Byb3AnKTtcblxuZXhwb3J0IGludGVyZmFjZSBJU3RyaW5nU291cmNlTWFwT3B0aW9ucyBleHRlbmRzIElHZW5lcmF0ZVN0cmluZ1NvdXJjZU1hcE9wdGlvbnNcbntcblx0c291cmNlPzogc3RyaW5nIHwgQnVmZmVyLFxuXHR0YXJnZXQ/OiBzdHJpbmcgfCBCdWZmZXIsXG59XG5cbmV4cG9ydCBjbGFzcyBTdHJpbmdTb3VyY2VNYXBcbntcblx0cHJvdGVjdGVkIFtTeW1IaWRkZW5dOiB7XG5cdFx0c291cmNlOiBzdHJpbmcsXG5cdFx0dGFyZ2V0OiBzdHJpbmcsXG5cdFx0bG9ja2VkOiBib29sZWFuLFxuXHRcdG9wdGlvbnM6IElTdHJpbmdTb3VyY2VNYXBPcHRpb25zLFxuXHRcdG1zOiBNYWdpY1N0cmluZyxcblx0XHRkaWZmOiBKU0RpZmZDaGFuZ2VbXSxcblx0XHRzb3VyY2VtYXA6IFNvdXJjZU1hcCxcblx0XHRzbWM6IFNvdXJjZU1hcENvbnN1bWVyLFxuXG5cdFx0X3RtcF9zb3VyY2U6IHN0cmluZ1tdLFxuXHRcdF90bXBfdGFyZ2V0OiBzdHJpbmdbXSxcblx0fSA9IHt9IGFzIGFueTtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zPzogSVN0cmluZ1NvdXJjZU1hcE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHR0aGlzLl9jb25zdHJ1Y3RvcihvcHRpb25zLCAuLi5hcmd2KVxuXHR9XG5cblx0cHJvdGVjdGVkIF9yZXNldCgpXG5cdHtcblx0XHRPYmplY3Qua2V5cyh0aGlzW1N5bUhpZGRlbl0pXG5cdFx0XHQuZm9yRWFjaChrZXkgPT4ge1xuXHRcdFx0XHRpZiAoa2V5LnN0YXJ0c1dpdGgoJ190bXBfJykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzW1N5bUhpZGRlbl1ba2V5XSA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cblx0QENoZWNrTG9ja2VkTWV0aG9kXG5cdHByb3RlY3RlZCBfY29uc3RydWN0b3Iob3B0aW9uczogSVN0cmluZ1NvdXJjZU1hcE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRvcHRpb25zID0gaGFuZGxlSW5wdXRPcHRpb25zKHtcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0fSk7XG5cblx0XHRsZXQgeyBzb3VyY2UsIHRhcmdldCB9ID0gb3B0aW9ucztcblxuXHRcdGRlbGV0ZSBvcHRpb25zLnNvdXJjZTtcblx0XHRkZWxldGUgb3B0aW9ucy50YXJnZXQ7XG5cblx0XHR0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucyA9IG1lcmdlKHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLCBvcHRpb25zKTtcblxuXHRcdGlmIChzb3VyY2UgIT0gbnVsbClcblx0XHR7XG5cdFx0XHR0aGlzLnNvdXJjZSA9IHNvdXJjZTtcblx0XHR9XG5cblx0XHRpZiAodGFyZ2V0ICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcmVzZXQoKTtcblxuXHRcdGxldCBfdGVtcCA9IHRoaXMuc291cmNlRmlsZTtcblxuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHRnZXQgc291cmNlKClcblx0e1xuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0uc291cmNlXG5cdH1cblxuXHRAQ2hlY2tMb2NrZWRQcm9wZXJ0eVxuXHRzZXQgc291cmNlKHZhbHVlOiBzdHJpbmcgfCBCdWZmZXIpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0uc291cmNlID0gaGFuZGxlSW5wdXRTdHJpbmcodmFsdWUsIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zKTtcblx0fVxuXG5cdGdldCBsb2NrZWQoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNbU3ltSGlkZGVuXSAmJiB0aGlzW1N5bUhpZGRlbl0ubG9ja2VkXG5cdH1cblxuXHRnZXQgdGFyZ2V0KClcblx0e1xuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0udGFyZ2V0XG5cdH1cblxuXHRAQ2hlY2tMb2NrZWRQcm9wZXJ0eVxuXHRzZXQgdGFyZ2V0KHZhbHVlOiBzdHJpbmcgfCBCdWZmZXIpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0udGFyZ2V0ID0gaGFuZGxlSW5wdXRTdHJpbmcodmFsdWUsIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zKTtcblx0fVxuXG5cdGdldCBzb3VyY2VtYXAoKVxuXHR7XG5cdFx0aWYgKHRoaXNbU3ltSGlkZGVuXS5zb3VyY2VtYXAgPT0gbnVsbCAmJiB0aGlzLmxvY2tlZClcblx0XHR7XG5cdFx0XHR0aGlzW1N5bUhpZGRlbl0uc291cmNlbWFwID0gZ2VuZXJhdGVNYWdpY1N0cmluZ01hcCh0aGlzW1N5bUhpZGRlbl0ubXMsIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zKVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0uc291cmNlbWFwXG5cdH1cblxuXHQvKipcblx0ICogU291cmNlTWFwQ29uc3VtZXJcblx0ICpcblx0ICogQHJldHVybnMge1NvdXJjZU1hcENvbnN1bWVyfVxuXHQgKi9cblx0Z2V0IHNtYygpOiBTb3VyY2VNYXBDb25zdW1lclxuXHR7XG5cdFx0aWYgKHRoaXNbU3ltSGlkZGVuXS5zbWMgPT0gbnVsbCAmJiB0aGlzLmxvY2tlZClcblx0XHR7XG5cdFx0XHR0aGlzW1N5bUhpZGRlbl0uc21jID0gY3JlYXRlU291cmNlTWFwQ29uc3VtZXJTeW5jKHRoaXMuc291cmNlbWFwKVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0uc21jXG5cdH1cblxuXHQvKipcblx0ICog5L6G5rqQ5qqU5qGI5ZCN56ixXG5cdCAqL1xuXHRnZXQgc291cmNlRmlsZSgpXG5cdHtcblx0XHRpZiAodGhpc1tTeW1IaWRkZW5dLm9wdGlvbnMuc291cmNlRmlsZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnNvdXJjZUZpbGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnNvdXJjZUZpbGVcblx0fVxuXG5cdEBDaGVja0xvY2tlZFByb3BlcnR5XG5cdHNldCBzb3VyY2VGaWxlKHZhbHVlOiBzdHJpbmcpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucy5zb3VyY2VGaWxlID0gdmFsdWUudG9TdHJpbmcoKVxuXHR9XG5cblx0LyoqXG5cdCAqIOebruaomeaqlOahiOWQjeeosVxuXHQgKi9cblx0Z2V0IHRhcmdldEZpbGUoKVxuXHR7XG5cdFx0aWYgKHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnRhcmdldEZpbGUgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5zb3VyY2VGaWxlXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnRhcmdldEZpbGVcblx0fVxuXG5cdEBDaGVja0xvY2tlZFByb3BlcnR5XG5cdHNldCB0YXJnZXRGaWxlKHZhbHVlOiBzdHJpbmcpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucy50YXJnZXRGaWxlID0gdmFsdWUudG9TdHJpbmcoKVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPquWFgeioseWft+ihjOS4gOasoe+8jOWft+ihjOW+jOacg+mOluWumuaLkue1leabtOaUueWxrOaAp1xuXHQgKi9cblx0QENoZWNrTG9ja2VkTWV0aG9kXG5cdHByb2Nlc3Mob3B0aW9ucz86IElTdHJpbmdTb3VyY2VNYXBPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0dGhpcy5fY29uc3RydWN0b3Iob3B0aW9ucywgLi4uYXJndik7XG5cblx0XHRpZiAodGhpcy5zb3VyY2UgPT0gbnVsbCB8fCB0aGlzLnRhcmdldCA9PSBudWxsKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYHNvdXJjZSBvciB0YXJnZXQgaXMgdW5kZWZpbmVkYClcblx0XHR9XG5cblx0XHR0aGlzW1N5bUhpZGRlbl0ubG9ja2VkID0gdHJ1ZTtcblxuXHRcdGxldCB7IG1zLCBkaWZmIH0gPSBkaWZmTWFnaWNTdHJpbmcodGhpcy5zb3VyY2UsIHRoaXMudGFyZ2V0LCB0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucyk7XG5cblx0XHR0aGlzW1N5bUhpZGRlbl0ubXMgPSBtcztcblx0XHR0aGlzW1N5bUhpZGRlbl0uZGlmZiA9IGRpZmY7XG5cblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHJvY2Vzc0ZvcmNlKG9wdGlvbnM/OiBJU3RyaW5nU291cmNlTWFwT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHRoaXNbU3ltSGlkZGVuXS5sb2NrZWQgPSBmYWxzZTtcblx0XHRyZXR1cm4gdGhpcy5wcm9jZXNzKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOippuWcluS4u+WLlemHi+aUvuiomOaGtumrlFxuXHQgKi9cblx0ZGVzdHJveSgpXG5cdHtcblx0XHR0aGlzLl9yZXNldCgpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlmICh0aGlzLnNtYyAmJiB0aGlzLnNtYy5kZXN0cm95KVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRoaXMuc21jLmRlc3Ryb3koKTtcblx0XHR9XG5cblx0XHRPYmplY3Qua2V5cyh0aGlzW1N5bUhpZGRlbl0pXG5cdFx0XHQuZm9yRWFjaChrID0+IGRlbGV0ZSB0aGlzW1N5bUhpZGRlbl1ba10pXG5cdFx0O1xuXG5cdFx0dGhpc1tTeW1IaWRkZW5dLmxvY2tlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGZha2VUaGVuPFIgZXh0ZW5kcyBhbnk+KGNiOiAodGhpczogdGhpcywgb2JqOiB0aGlzKSA9PiBJVFNSZXNvbHZhYmxlPFI+KVxuXHR7XG5cdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHQucmVzb2x2ZSh0aGlzKVxuXHRcdFx0LmJpbmQodGhpcylcblx0XHRcdC50aGVuKGNiKVxuXHRcdFx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOW+niB0YXJnZXQg55qE6KGM5YiX5L2N572u5L6G5Y+N5p+l5ZyoIHNvdXJjZSDlhafnmoTljp/lp4vkvY3nva5cblx0ICovXG5cdG9yaWdpbmFsUG9zaXRpb25Gb3IoZ2VuZXJhdGVkUG9zaXRpb246IEZpbmRQb3NpdGlvbilcblx0e1xuXHRcdHJldHVybiB0aGlzLnNtYy5vcmlnaW5hbFBvc2l0aW9uRm9yKGdlbmVyYXRlZFBvc2l0aW9uKVxuXHR9XG5cblx0LyoqXG5cdCAqIOW+niBzb3VyY2Ug5YWn55qE5Y6f5aeL5L2N572u5L6G5p+l6Kmi5ZyoIHRhcmdldCDnmoTooYzliJfkvY3nva5cblx0ICovXG5cdGdlbmVyYXRlZFBvc2l0aW9uRm9yKG9yaWdpbmFsUG9zaXRpb246IElUU1BhcnRpYWxXaXRoPFNvdXJjZUZpbmRQb3NpdGlvbiwgJ3NvdXJjZSc+KVxuXHR7XG5cdFx0aWYgKG9yaWdpbmFsUG9zaXRpb24uc291cmNlID09IG51bGwpXG5cdFx0e1xuXHRcdFx0b3JpZ2luYWxQb3NpdGlvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZUZpbGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuc21jLmdlbmVyYXRlZFBvc2l0aW9uRm9yKG9yaWdpbmFsUG9zaXRpb24gYXMgU291cmNlRmluZFBvc2l0aW9uKVxuXHR9XG5cblx0YWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yKG9yaWdpbmFsUG9zaXRpb246IElUU1BhcnRpYWxXaXRoPE1hcHBlZFBvc2l0aW9uLCAnc291cmNlJz4pXG5cdHtcblx0XHRpZiAob3JpZ2luYWxQb3NpdGlvbi5zb3VyY2UgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRvcmlnaW5hbFBvc2l0aW9uLnNvdXJjZSA9IHRoaXMuc291cmNlRmlsZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5zbWMuYWxsR2VuZXJhdGVkUG9zaXRpb25zRm9yKG9yaWdpbmFsUG9zaXRpb24gYXMgTWFwcGVkUG9zaXRpb24pXG5cdH1cblxuXHR0b0pTT04oKTogUmF3U291cmNlTWFwXG5cdHtcblx0XHRsZXQge1xuXHRcdFx0dmVyc2lvbixcblx0XHRcdGZpbGUsXG5cdFx0XHRzb3VyY2VzLFxuXHRcdFx0c291cmNlc0NvbnRlbnQsXG5cdFx0XHRtYXBwaW5ncyxcblx0XHRcdG5hbWVzLFxuXHRcdH0gPSB0aGlzLnNvdXJjZW1hcDtcblxuXHRcdHJldHVybiBjbG9uZURlZXAoe1xuXHRcdFx0dmVyc2lvbjogdmVyc2lvbi50b1N0cmluZygpLFxuXHRcdFx0ZmlsZSxcblx0XHRcdHNvdXJjZXMsXG5cdFx0XHRzb3VyY2VzQ29udGVudCxcblx0XHRcdG1hcHBpbmdzLFxuXHRcdFx0bmFtZXMsXG5cdFx0fSlcblx0fVxuXG5cdHRvU3RyaW5nKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnNvdXJjZW1hcC50b1N0cmluZygpXG5cdH1cblxuXHQvKipcblx0ICogc291cmNlbWFwIOeahCBiYXNlNjQgdXJsXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqL1xuXHR0b1VybChpbmNsdWRlQ29tbWVudD86IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgdXJsID0gdGhpcy5zb3VyY2VtYXAudG9VcmwoKTtcblxuXHRcdGlmIChpbmNsdWRlQ29tbWVudClcblx0XHR7XG5cdFx0XHR1cmwgPSAnLy8jIHNvdXJjZU1hcHBpbmdVUkw9JyArIHVybDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdXJsXG5cdH1cblxuXHQvKipcblx0ICog5Lul5paw5YWn5a6555qE5L2N572u6LOH6KiK5L6G5p+l6Kmi5Y6f5aeL5L2N572u6IiH5paH5a2X5YWn5a65XG5cdCAqL1xuXHRvcmlnaW5hbExpbmVGb3IoZ2VuZXJhdGVkUG9zaXRpb246IElUU1ZhbHVlT3JBcnJheTxGaW5kUG9zaXRpb24+KVxuXHR7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGdlbmVyYXRlZFBvc2l0aW9uKSlcblx0XHR7XG5cdFx0XHRnZW5lcmF0ZWRQb3NpdGlvbiA9IFtnZW5lcmF0ZWRQb3NpdGlvbl1cblx0XHR9XG5cblx0XHRsZXQgcG9zID0gZ2VuZXJhdGVkUG9zaXRpb24ubWFwKHBvcyA9PiB0aGlzLm9yaWdpbmFsUG9zaXRpb25Gb3IocG9zKSk7XG5cblx0XHRyZXR1cm4gdGhpcy5vcmlnaW5hbExpbmVzKHBvcyk7XG5cdH1cblxuXHQvKipcblx0ICog5Lul5Y6f5aeL5YWn5a6555qE5L2N572u6LOH6KiK5L6G5p+l6Kmi5paw5L2N572u6IiH5paH5a2X5YWn5a65XG5cdCAqL1xuXHRnZW5lcmF0ZWRMaW5lRm9yKC4uLmFyZ3Y6IFBhcmFtZXRlcnM8U3RyaW5nU291cmNlTWFwW1wiZ2VuZXJhdGVkUG9zaXRpb25Gb3JcIl0+KVxuXHR7XG5cdFx0bGV0IHBvcyA9IHRoaXMuZ2VuZXJhdGVkUG9zaXRpb25Gb3IoLi4uYXJndik7XG5cblx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZWRMaW5lcyhwb3MpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zcGxpdExpbmVzKGtleTogJ3NvdXJjZScgfCAndGFyZ2V0Jylcblx0e1xuXHRcdGxldCBrZXlfY2FjaGUgPSBgX3RtcF8ke2tleX1gO1xuXG5cdFx0aWYgKCF0aGlzW1N5bUhpZGRlbl1ba2V5X2NhY2hlXSlcblx0XHR7XG5cdFx0XHR0aGlzW1N5bUhpZGRlbl1ba2V5X2NhY2hlXSA9IHNwbGl0TGluZXModGhpc1trZXldKVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl1ba2V5X2NhY2hlXVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+WOn+Wni+Wtl+S4suS4reeahCDooYzliJcg5omA5Zyo5paH5a2X5YWn5a65XG5cdCAqL1xuXHRvcmlnaW5hbExpbmVzPFQgZXh0ZW5kcyBQb3NpdGlvbj4ocG9zaXRpb246IElUU1ZhbHVlT3JBcnJheTxJVFNQYXJ0aWFsV2l0aDxULCAnY29sdW1uJz4+KVxuXHR7XG5cdFx0cmV0dXJuIGdldExpbmVDb2x1bW4odGhpcy5fc3BsaXRMaW5lcygnc291cmNlJyksIHBvc2l0aW9uKVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aWsOWtl+S4suS4reeahCDooYzliJcg5omA5Zyo5paH5a2X5YWn5a65XG5cdCAqL1xuXHRnZW5lcmF0ZWRMaW5lczxUIGV4dGVuZHMgUG9zaXRpb24+KHBvc2l0aW9uOiBJVFNWYWx1ZU9yQXJyYXk8SVRTUGFydGlhbFdpdGg8VCwgJ2NvbHVtbic+Pilcblx0e1xuXHRcdHJldHVybiBnZXRMaW5lQ29sdW1uKHRoaXMuX3NwbGl0TGluZXMoJ3RhcmdldCcpLCBwb3NpdGlvbilcblx0fVxuXG5cdGNyZWF0ZVBhdGNoKG9wdGlvbnM6IElQYXRjaE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdHJldHVybiBjcmVhdGVUd29GaWxlc1BhdGNoKHRoaXMuc291cmNlRmlsZSwgdGhpcy50YXJnZXRGaWxlLCB0aGlzLnNvdXJjZSBhcyBzdHJpbmcsIHRoaXMudGFyZ2V0IGFzIHN0cmluZywgb3B0aW9ucy5vbGRIZWFkZXIsIG9wdGlvbnMubmV3SGVhZGVyLCBvcHRpb25zLnBhdGNoT3B0aW9ucylcblx0fVxuXG5cdGNvbXB1dGVDb2x1bW5TcGFucygpXG5cdHtcblx0XHR0aGlzLnNtYy5jb21wdXRlQ29sdW1uU3BhbnMoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGVhY2hNYXBwaW5nPEMgZXh0ZW5kcyBhbnkgPSB0aGlzPihjYWxsYmFjazogKHRoaXM6IEMsIG1hcHBpbmc6IE1hcHBpbmdJdGVtKSA9PiB2b2lkLCBjb250ZXh0PzogQywgb3JkZXI/OiB0eXBlb2YgU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSIHwgdHlwZW9mIFNvdXJjZU1hcENvbnN1bWVyLk9SSUdJTkFMX09SREVSKVxuXHR7XG5cdFx0aWYgKHR5cGVvZiBjb250ZXh0ID09PSAndW5kZWZpbmVkJylcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRjb250ZXh0ID0gdGhpcztcblx0XHR9XG5cblx0XHR0aGlzLnNtYy5lYWNoTWFwcGluZyhjYWxsYmFjaywgY29udGV4dCwgb3JkZXIpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzdGF0aWMgZnJvbVN0cmluZ1dpdGhTb3VyY2VNYXA8VCBleHRlbmRzIFN0cmluZ1NvdXJjZU1hcCA9IFN0cmluZ1NvdXJjZU1hcD4oc291cmNlOiBzdHJpbmcgfCBCdWZmZXIsIHNvdXJjZU1hcENvbnN1bWVyOiBTb3VyY2VNYXBDb25zdW1lciB8IHN0cmluZyB8IFJhd1NvdXJjZU1hcClcblx0e1xuXHRcdHNvdXJjZSA9IHNvdXJjZS50b1N0cmluZygpO1xuXG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0aWYgKCEoc2VsZiBpbnN0YW5jZW9mIFN0cmluZ1NvdXJjZU1hcCkpXG5cdFx0e1xuXHRcdFx0c2VsZiA9IFN0cmluZ1NvdXJjZU1hcFxuXHRcdH1cblxuXHRcdGxldCBzc20gPSBuZXcgc2VsZih7XG5cdFx0XHRzb3VyY2UsXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gc3NtIGFzIGFueSBhcyBUO1xuXHR9XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUGF0Y2hPcHRpb25zXG57XG5cdG9sZEhlYWRlcj86IHN0cmluZyxcblx0bmV3SGVhZGVyPzogc3RyaW5nLFxuXHRwYXRjaE9wdGlvbnM/OiBQYXRjaE9wdGlvbnMsXG59XG5cbmZ1bmN0aW9uIENoZWNrTG9ja2VkUHJvcGVydHk8VCBleHRlbmRzIGFueT4odGFyZ2V0OiBhbnksIHByb3A6IElUU1Byb3BlcnR5S2V5LCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxUPilcbntcblx0Y29uc3Qgb2xkID0gZGVzY3JpcHRvci5zZXQ7XG5cdC8vIEB0cy1pZ25vcmVcblx0ZGVzY3JpcHRvci5zZXQgPSBmdW5jdGlvbiAodGhpczogU3RyaW5nU291cmNlTWFwLCAuLi5hcmd2KVxuXHR7XG5cdFx0aWYgKHRoaXMubG9ja2VkKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgbG9ja2VkYClcblx0XHR9XG5cblx0XHRyZXR1cm4gb2xkLmFwcGx5KHRoaXMsIGFyZ3YpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBDaGVja0xvY2tlZE1ldGhvZDxUIGV4dGVuZHMgYW55Pih0YXJnZXQ6IGFueSwgcHJvcDogSVRTUHJvcGVydHlLZXksIGRlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPFQ+KVxue1xuXHRjb25zdCBvbGQgPSBkZXNjcmlwdG9yLnZhbHVlO1xuXHQvLyBAdHMtaWdub3JlXG5cdGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAodGhpczogU3RyaW5nU291cmNlTWFwLCAuLi5hcmd2KVxuXHR7XG5cdFx0aWYgKHRoaXMubG9ja2VkKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgbG9ja2VkYClcblx0XHR9XG5cblx0XHRyZXR1cm4gb2xkLmFwcGx5KHRoaXMsIGFyZ3YpO1xuXHR9O1xuXG5cdHJldHVybiBkZXNjcmlwdG9yXG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0cmluZ1NvdXJjZU1hcFxuIl19