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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FLZ0I7QUFFaEIsK0JBQThGO0FBUzlGLGtEQUFpRDtBQUVqRCx3REFBZ0M7QUFDaEMsaUVBQXlDO0FBQ3pDLHlEQUFpQztBQUVqQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFRakMsTUFBYSxlQUFlO0lBZ0IzQixZQUFZLE9BQWlDLEVBQUUsR0FBRyxJQUFJO1FBZDVDLFFBQVcsR0FZakIsRUFBUyxDQUFDO1FBSWIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRVMsTUFBTTtRQUVmLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNkLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDM0I7Z0JBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQzthQUM1QjtRQUNGLENBQUMsQ0FBQyxDQUNGO0lBQ0YsQ0FBQztJQUdTLFlBQVksQ0FBQyxPQUFnQyxFQUFFLEdBQUcsSUFBSTtRQUUvRCxPQUFPLEdBQUcseUJBQWtCLENBQUM7WUFDNUIsR0FBRyxPQUFPO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFakMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3RCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxHQUFHLGVBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8s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QW1COzs7NkNBSW5CO0FBYUQ7SUFEQyxtQkFBbUI7Ozs2Q0FJbkI7QUF5Q0Q7SUFEQyxtQkFBbUI7OztpREFJbkI7QUFnQkQ7SUFEQyxtQkFBbUI7OztpREFJbkI7QUFNRDtJQURDLGlCQUFpQjs7Ozs4Q0FrQmpCO0FBL0tGLDBDQTBWQztBQVNELFNBQVMsbUJBQW1CLENBQWdCLE1BQVcsRUFBRSxJQUFvQixFQUFFLFVBQXNDO0lBRXBILE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7SUFDM0IsYUFBYTtJQUNiLFVBQVUsQ0FBQyxHQUFHLEdBQUcsVUFBaUMsR0FBRyxJQUFJO1FBRXhELElBQUksSUFBSSxDQUFDLE1BQU0sRUFDZjtZQUNDLE1BQU0sSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDbEM7UUFFRCxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUMsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFnQixNQUFXLEVBQUUsSUFBb0IsRUFBRSxVQUFzQztJQUVsSCxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQzdCLGFBQWE7SUFDYixVQUFVLENBQUMsS0FBSyxHQUFHLFVBQWlDLEdBQUcsSUFBSTtRQUUxRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQ2Y7WUFDQyxNQUFNLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQ2xDO1FBRUQsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUM7SUFFRixPQUFPLFVBQVUsQ0FBQTtBQUNsQixDQUFDO0FBRUQsa0JBQWUsZUFBZSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0SUdlbmVyYXRlU3RyaW5nU291cmNlTWFwT3B0aW9ucyxcblx0aGFuZGxlSW5wdXRPcHRpb25zLFxuXHRoYW5kbGVJbnB1dFN0cmluZyxcblx0Z2VuZXJhdGVTdHJpbmdTb3VyY2VNYXAsIGRpZmZNYWdpY1N0cmluZywgZ2VuZXJhdGVNYWdpY1N0cmluZ01hcCwgZ2V0TGluZUNvbHVtbiwgc3BsaXRMaW5lcyxcbn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBNYWdpY1N0cmluZywgeyBTb3VyY2VNYXAgfSBmcm9tICdtYWdpYy1zdHJpbmcnO1xuaW1wb3J0IHsgQ2hhbmdlIGFzIEpTRGlmZkNoYW5nZSwgY3JlYXRlUGF0Y2gsIGNyZWF0ZVR3b0ZpbGVzUGF0Y2gsIFBhdGNoT3B0aW9ucyB9IGZyb20gJ2RpZmYnO1xuaW1wb3J0IHtcblx0U291cmNlTWFwQ29uc3VtZXIsXG5cdFNvdXJjZUZpbmRQb3NpdGlvbixcblx0RmluZFBvc2l0aW9uLFxuXHRQb3NpdGlvbixcblx0TWFwcGVkUG9zaXRpb24sXG5cdFJhd1NvdXJjZU1hcCxcbn0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQgY3JlYXRlU291cmNlTWFwQ29uc3VtZXJTeW5jIGZyb20gJy4vc3luYyc7XG5pbXBvcnQgeyBJVFNSZXNvbHZhYmxlLCBJVFNQYXJ0aWFsV2l0aCwgSVRTUHJvcGVydHlLZXksIElUU1ZhbHVlT3JBcnJheSB9IGZyb20gJ3RzLXR5cGUnO1xuaW1wb3J0IEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlJztcblxuY29uc3QgU3ltSGlkZGVuID0gU3ltYm9sKCdwcm9wJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVN0cmluZ1NvdXJjZU1hcE9wdGlvbnMgZXh0ZW5kcyBJR2VuZXJhdGVTdHJpbmdTb3VyY2VNYXBPcHRpb25zXG57XG5cdHNvdXJjZT86IHN0cmluZyB8IEJ1ZmZlcixcblx0dGFyZ2V0Pzogc3RyaW5nIHwgQnVmZmVyLFxufVxuXG5leHBvcnQgY2xhc3MgU3RyaW5nU291cmNlTWFwXG57XG5cdHByb3RlY3RlZCBbU3ltSGlkZGVuXToge1xuXHRcdHNvdXJjZTogc3RyaW5nLFxuXHRcdHRhcmdldDogc3RyaW5nLFxuXHRcdGxvY2tlZDogYm9vbGVhbixcblx0XHRvcHRpb25zOiBJU3RyaW5nU291cmNlTWFwT3B0aW9ucyxcblx0XHRtczogTWFnaWNTdHJpbmcsXG5cdFx0ZGlmZjogSlNEaWZmQ2hhbmdlW10sXG5cdFx0c291cmNlbWFwOiBTb3VyY2VNYXAsXG5cdFx0c21jOiBTb3VyY2VNYXBDb25zdW1lcixcblxuXHRcdF90bXBfc291cmNlOiBzdHJpbmdbXSxcblx0XHRfdG1wX3RhcmdldDogc3RyaW5nW10sXG5cdH0gPSB7fSBhcyBhbnk7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucz86IElTdHJpbmdTb3VyY2VNYXBPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0dGhpcy5fY29uc3RydWN0b3Iob3B0aW9ucywgLi4uYXJndilcblx0fVxuXG5cdHByb3RlY3RlZCBfcmVzZXQoKVxuXHR7XG5cdFx0T2JqZWN0LmtleXModGhpc1tTeW1IaWRkZW5dKVxuXHRcdFx0LmZvckVhY2goa2V5ID0+IHtcblx0XHRcdFx0aWYgKGtleS5zdGFydHNXaXRoKCdfdG1wXycpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpc1tTeW1IaWRkZW5dW2tleV0gPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdDtcblx0fVxuXG5cdEBDaGVja0xvY2tlZE1ldGhvZFxuXHRwcm90ZWN0ZWQgX2NvbnN0cnVjdG9yKG9wdGlvbnM6IElTdHJpbmdTb3VyY2VNYXBPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0b3B0aW9ucyA9IGhhbmRsZUlucHV0T3B0aW9ucyh7XG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdH0pO1xuXG5cdFx0bGV0IHsgc291cmNlLCB0YXJnZXQgfSA9IG9wdGlvbnM7XG5cblx0XHRkZWxldGUgb3B0aW9ucy5zb3VyY2U7XG5cdFx0ZGVsZXRlIG9wdGlvbnMudGFyZ2V0O1xuXG5cdFx0dGhpc1tTeW1IaWRkZW5dLm9wdGlvbnMgPSBtZXJnZSh0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucywgb3B0aW9ucyk7XG5cblx0XHRpZiAoc291cmNlICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0dGhpcy5zb3VyY2UgPSBzb3VyY2U7XG5cdFx0fVxuXG5cdFx0aWYgKHRhcmdldCAhPSBudWxsKVxuXHRcdHtcblx0XHRcdHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdH1cblxuXHRcdHRoaXMuX3Jlc2V0KCk7XG5cblx0XHRsZXQgX3RlbXAgPSB0aGlzLnNvdXJjZUZpbGU7XG5cblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0Z2V0IHNvdXJjZSgpXG5cdHtcblx0XHRyZXR1cm4gdGhpc1tTeW1IaWRkZW5dLnNvdXJjZVxuXHR9XG5cblx0QENoZWNrTG9ja2VkUHJvcGVydHlcblx0c2V0IHNvdXJjZSh2YWx1ZTogc3RyaW5nIHwgQnVmZmVyKVxuXHR7XG5cdFx0dGhpc1tTeW1IaWRkZW5dLnNvdXJjZSA9IGhhbmRsZUlucHV0U3RyaW5nKHZhbHVlLCB0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucyk7XG5cdH1cblxuXHRnZXQgbG9ja2VkKClcblx0e1xuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0gJiYgdGhpc1tTeW1IaWRkZW5dLmxvY2tlZFxuXHR9XG5cblx0Z2V0IHRhcmdldCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpc1tTeW1IaWRkZW5dLnRhcmdldFxuXHR9XG5cblx0QENoZWNrTG9ja2VkUHJvcGVydHlcblx0c2V0IHRhcmdldCh2YWx1ZTogc3RyaW5nIHwgQnVmZmVyKVxuXHR7XG5cdFx0dGhpc1tTeW1IaWRkZW5dLnRhcmdldCA9IGhhbmRsZUlucHV0U3RyaW5nKHZhbHVlLCB0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucyk7XG5cdH1cblxuXHRnZXQgc291cmNlbWFwKClcblx0e1xuXHRcdGlmICh0aGlzW1N5bUhpZGRlbl0uc291cmNlbWFwID09IG51bGwgJiYgdGhpcy5sb2NrZWQpXG5cdFx0e1xuXHRcdFx0dGhpc1tTeW1IaWRkZW5dLnNvdXJjZW1hcCA9IGdlbmVyYXRlTWFnaWNTdHJpbmdNYXAodGhpc1tTeW1IaWRkZW5dLm1zLCB0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucylcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpc1tTeW1IaWRkZW5dLnNvdXJjZW1hcFxuXHR9XG5cblx0LyoqXG5cdCAqIFNvdXJjZU1hcENvbnN1bWVyXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtTb3VyY2VNYXBDb25zdW1lcn1cblx0ICovXG5cdGdldCBzbWMoKTogU291cmNlTWFwQ29uc3VtZXJcblx0e1xuXHRcdGlmICh0aGlzW1N5bUhpZGRlbl0uc21jID09IG51bGwgJiYgdGhpcy5sb2NrZWQpXG5cdFx0e1xuXHRcdFx0dGhpc1tTeW1IaWRkZW5dLnNtYyA9IGNyZWF0ZVNvdXJjZU1hcENvbnN1bWVyU3luYyh0aGlzLnNvdXJjZW1hcClcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpc1tTeW1IaWRkZW5dLnNtY1xuXHR9XG5cblx0LyoqXG5cdCAqIOS+hua6kOaqlOahiOWQjeeosVxuXHQgKi9cblx0Z2V0IHNvdXJjZUZpbGUoKVxuXHR7XG5cdFx0aWYgKHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnNvdXJjZUZpbGUgPT0gbnVsbClcblx0XHR7XG5cdFx0XHR0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucy5zb3VyY2VGaWxlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucy5zb3VyY2VGaWxlXG5cdH1cblxuXHRAQ2hlY2tMb2NrZWRQcm9wZXJ0eVxuXHRzZXQgc291cmNlRmlsZSh2YWx1ZTogc3RyaW5nKVxuXHR7XG5cdFx0dGhpc1tTeW1IaWRkZW5dLm9wdGlvbnMuc291cmNlRmlsZSA9IHZhbHVlLnRvU3RyaW5nKClcblx0fVxuXG5cdC8qKlxuXHQgKiDnm67mqJnmqpTmoYjlkI3nqLFcblx0ICovXG5cdGdldCB0YXJnZXRGaWxlKClcblx0e1xuXHRcdGlmICh0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucy50YXJnZXRGaWxlID09IG51bGwpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXMuc291cmNlRmlsZVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucy50YXJnZXRGaWxlXG5cdH1cblxuXHRAQ2hlY2tMb2NrZWRQcm9wZXJ0eVxuXHRzZXQgdGFyZ2V0RmlsZSh2YWx1ZTogc3RyaW5nKVxuXHR7XG5cdFx0dGhpc1tTeW1IaWRkZW5dLm9wdGlvbnMudGFyZ2V0RmlsZSA9IHZhbHVlLnRvU3RyaW5nKClcblx0fVxuXG5cdC8qKlxuXHQgKiDlj6rlhYHoqLHln7fooYzkuIDmrKHvvIzln7fooYzlvozmnIPpjpblrprmi5LntZXmm7TmlLnlsazmgKdcblx0ICovXG5cdEBDaGVja0xvY2tlZE1ldGhvZFxuXHRwcm9jZXNzKG9wdGlvbnM/OiBJU3RyaW5nU291cmNlTWFwT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHRoaXMuX2NvbnN0cnVjdG9yKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXG5cdFx0aWYgKHRoaXMuc291cmNlID09IG51bGwgfHwgdGhpcy50YXJnZXQgPT0gbnVsbClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBzb3VyY2Ugb3IgdGFyZ2V0IGlzIHVuZGVmaW5lZGApXG5cdFx0fVxuXG5cdFx0dGhpc1tTeW1IaWRkZW5dLmxvY2tlZCA9IHRydWU7XG5cblx0XHRsZXQgeyBtcywgZGlmZiB9ID0gZGlmZk1hZ2ljU3RyaW5nKHRoaXMuc291cmNlLCB0aGlzLnRhcmdldCwgdGhpc1tTeW1IaWRkZW5dLm9wdGlvbnMpO1xuXG5cdFx0dGhpc1tTeW1IaWRkZW5dLm1zID0gbXM7XG5cdFx0dGhpc1tTeW1IaWRkZW5dLmRpZmYgPSBkaWZmO1xuXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdHByb2Nlc3NGb3JjZShvcHRpb25zPzogSVN0cmluZ1NvdXJjZU1hcE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0ubG9ja2VkID0gZmFsc2U7XG5cdFx0cmV0dXJuIHRoaXMucHJvY2VzcyhvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdC8qKlxuXHQgKiDoqablnJbkuLvli5Xph4vmlL7oqJjmhrbpq5Rcblx0ICovXG5cdGRlc3Ryb3koKVxuXHR7XG5cdFx0dGhpcy5fcmVzZXQoKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpZiAodGhpcy5zbWMgJiYgdGhpcy5zbWMuZGVzdHJveSlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aGlzLnNtYy5kZXN0cm95KCk7XG5cdFx0fVxuXG5cdFx0T2JqZWN0LmtleXModGhpc1tTeW1IaWRkZW5dKVxuXHRcdFx0LmZvckVhY2goayA9PiBkZWxldGUgdGhpc1tTeW1IaWRkZW5dW2tdKVxuXHRcdDtcblxuXHRcdHRoaXNbU3ltSGlkZGVuXS5sb2NrZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRmYWtlVGhlbjxSIGV4dGVuZHMgYW55PihjYjogKHRoaXM6IHRoaXMsIG9iajogdGhpcykgPT4gSVRTUmVzb2x2YWJsZTxSPilcblx0e1xuXHRcdHJldHVybiBCbHVlYmlyZFxuXHRcdFx0LnJlc29sdmUodGhpcylcblx0XHRcdC5iaW5kKHRoaXMpXG5cdFx0XHQudGhlbihjYilcblx0XHRcdDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlvp4gdGFyZ2V0IOeahOihjOWIl+S9jee9ruS+huWPjeafpeWcqCBzb3VyY2Ug5YWn55qE5Y6f5aeL5L2N572uXG5cdCAqL1xuXHRvcmlnaW5hbFBvc2l0aW9uRm9yKGdlbmVyYXRlZFBvc2l0aW9uOiBGaW5kUG9zaXRpb24pXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5zbWMub3JpZ2luYWxQb3NpdGlvbkZvcihnZW5lcmF0ZWRQb3NpdGlvbilcblx0fVxuXG5cdC8qKlxuXHQgKiDlvp4gc291cmNlIOWFp+eahOWOn+Wni+S9jee9ruS+huafpeipouWcqCB0YXJnZXQg55qE6KGM5YiX5L2N572uXG5cdCAqL1xuXHRnZW5lcmF0ZWRQb3NpdGlvbkZvcihvcmlnaW5hbFBvc2l0aW9uOiBJVFNQYXJ0aWFsV2l0aDxTb3VyY2VGaW5kUG9zaXRpb24sICdzb3VyY2UnPilcblx0e1xuXHRcdGlmIChvcmlnaW5hbFBvc2l0aW9uLnNvdXJjZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdG9yaWdpbmFsUG9zaXRpb24uc291cmNlID0gdGhpcy5zb3VyY2VGaWxlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnNtYy5nZW5lcmF0ZWRQb3NpdGlvbkZvcihvcmlnaW5hbFBvc2l0aW9uIGFzIFNvdXJjZUZpbmRQb3NpdGlvbilcblx0fVxuXG5cdGFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvcihvcmlnaW5hbFBvc2l0aW9uOiBJVFNQYXJ0aWFsV2l0aDxNYXBwZWRQb3NpdGlvbiwgJ3NvdXJjZSc+KVxuXHR7XG5cdFx0aWYgKG9yaWdpbmFsUG9zaXRpb24uc291cmNlID09IG51bGwpXG5cdFx0e1xuXHRcdFx0b3JpZ2luYWxQb3NpdGlvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZUZpbGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuc21jLmFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvcihvcmlnaW5hbFBvc2l0aW9uIGFzIE1hcHBlZFBvc2l0aW9uKVxuXHR9XG5cblx0dG9KU09OKCk6IFJhd1NvdXJjZU1hcFxuXHR7XG5cdFx0bGV0IHtcblx0XHRcdHZlcnNpb24sXG5cdFx0XHRmaWxlLFxuXHRcdFx0c291cmNlcyxcblx0XHRcdHNvdXJjZXNDb250ZW50LFxuXHRcdFx0bWFwcGluZ3MsXG5cdFx0XHRuYW1lcyxcblx0XHR9ID0gdGhpcy5zb3VyY2VtYXA7XG5cblx0XHRyZXR1cm4gY2xvbmVEZWVwKHtcblx0XHRcdHZlcnNpb246IHZlcnNpb24udG9TdHJpbmcoKSxcblx0XHRcdGZpbGUsXG5cdFx0XHRzb3VyY2VzLFxuXHRcdFx0c291cmNlc0NvbnRlbnQsXG5cdFx0XHRtYXBwaW5ncyxcblx0XHRcdG5hbWVzLFxuXHRcdH0pXG5cdH1cblxuXHR0b1N0cmluZygpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5zb3VyY2VtYXAudG9TdHJpbmcoKVxuXHR9XG5cblx0LyoqXG5cdCAqIHNvdXJjZW1hcCDnmoQgYmFzZTY0IHVybFxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHQgKi9cblx0dG9VcmwoaW5jbHVkZUNvbW1lbnQ/OiBib29sZWFuKVxuXHR7XG5cdFx0bGV0IHVybCA9IHRoaXMuc291cmNlbWFwLnRvVXJsKCk7XG5cblx0XHRpZiAoaW5jbHVkZUNvbW1lbnQpXG5cdFx0e1xuXHRcdFx0dXJsID0gJy8vIyBzb3VyY2VNYXBwaW5nVVJMPScgKyB1cmw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVybFxuXHR9XG5cblx0LyoqXG5cdCAqIOS7peaWsOWFp+WuueeahOS9jee9ruizh+ioiuS+huafpeipouWOn+Wni+S9jee9ruiIh+aWh+Wtl+WFp+WuuVxuXHQgKi9cblx0b3JpZ2luYWxMaW5lRm9yKGdlbmVyYXRlZFBvc2l0aW9uOiBJVFNWYWx1ZU9yQXJyYXk8RmluZFBvc2l0aW9uPilcblx0e1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShnZW5lcmF0ZWRQb3NpdGlvbikpXG5cdFx0e1xuXHRcdFx0Z2VuZXJhdGVkUG9zaXRpb24gPSBbZ2VuZXJhdGVkUG9zaXRpb25dXG5cdFx0fVxuXG5cdFx0bGV0IHBvcyA9IGdlbmVyYXRlZFBvc2l0aW9uLm1hcChwb3MgPT4gdGhpcy5vcmlnaW5hbFBvc2l0aW9uRm9yKHBvcykpO1xuXG5cdFx0cmV0dXJuIHRoaXMub3JpZ2luYWxMaW5lcyhwb3MpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOS7peWOn+Wni+WFp+WuueeahOS9jee9ruizh+ioiuS+huafpeipouaWsOS9jee9ruiIh+aWh+Wtl+WFp+WuuVxuXHQgKi9cblx0Z2VuZXJhdGVkTGluZUZvciguLi5hcmd2OiBQYXJhbWV0ZXJzPFN0cmluZ1NvdXJjZU1hcFtcImdlbmVyYXRlZFBvc2l0aW9uRm9yXCJdPilcblx0e1xuXHRcdGxldCBwb3MgPSB0aGlzLmdlbmVyYXRlZFBvc2l0aW9uRm9yKC4uLmFyZ3YpO1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVkTGluZXMocG9zKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3BsaXRMaW5lcyhrZXk6ICdzb3VyY2UnIHwgJ3RhcmdldCcpXG5cdHtcblx0XHRsZXQga2V5X2NhY2hlID0gYF90bXBfJHtrZXl9YDtcblxuXHRcdGlmICghdGhpc1tTeW1IaWRkZW5dW2tleV9jYWNoZV0pXG5cdFx0e1xuXHRcdFx0dGhpc1tTeW1IaWRkZW5dW2tleV9jYWNoZV0gPSBzcGxpdExpbmVzKHRoaXNba2V5XSlcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpc1tTeW1IaWRkZW5dW2tleV9jYWNoZV1cblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfljp/lp4vlrZfkuLLkuK3nmoQg6KGM5YiXIOaJgOWcqOaWh+Wtl+WFp+WuuVxuXHQgKi9cblx0b3JpZ2luYWxMaW5lczxUIGV4dGVuZHMgUG9zaXRpb24+KHBvc2l0aW9uOiBJVFNWYWx1ZU9yQXJyYXk8SVRTUGFydGlhbFdpdGg8VCwgJ2NvbHVtbic+Pilcblx0e1xuXHRcdHJldHVybiBnZXRMaW5lQ29sdW1uKHRoaXMuX3NwbGl0TGluZXMoJ3NvdXJjZScpLCBwb3NpdGlvbilcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmlrDlrZfkuLLkuK3nmoQg6KGM5YiXIOaJgOWcqOaWh+Wtl+WFp+WuuVxuXHQgKi9cblx0Z2VuZXJhdGVkTGluZXM8VCBleHRlbmRzIFBvc2l0aW9uPihwb3NpdGlvbjogSVRTVmFsdWVPckFycmF5PElUU1BhcnRpYWxXaXRoPFQsICdjb2x1bW4nPj4pXG5cdHtcblx0XHRyZXR1cm4gZ2V0TGluZUNvbHVtbih0aGlzLl9zcGxpdExpbmVzKCd0YXJnZXQnKSwgcG9zaXRpb24pXG5cdH1cblxuXHRjcmVhdGVQYXRjaChvcHRpb25zOiBJUGF0Y2hPcHRpb25zID0ge30pXG5cdHtcblx0XHRyZXR1cm4gY3JlYXRlVHdvRmlsZXNQYXRjaCh0aGlzLnNvdXJjZUZpbGUsIHRoaXMudGFyZ2V0RmlsZSwgdGhpcy5zb3VyY2UgYXMgc3RyaW5nLCB0aGlzLnRhcmdldCBhcyBzdHJpbmcsIG9wdGlvbnMub2xkSGVhZGVyLCBvcHRpb25zLm5ld0hlYWRlciwgb3B0aW9ucy5wYXRjaE9wdGlvbnMpXG5cdH1cblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQYXRjaE9wdGlvbnNcbntcblx0b2xkSGVhZGVyPzogc3RyaW5nLFxuXHRuZXdIZWFkZXI/OiBzdHJpbmcsXG5cdHBhdGNoT3B0aW9ucz86IFBhdGNoT3B0aW9ucyxcbn1cblxuZnVuY3Rpb24gQ2hlY2tMb2NrZWRQcm9wZXJ0eTxUIGV4dGVuZHMgYW55Pih0YXJnZXQ6IGFueSwgcHJvcDogSVRTUHJvcGVydHlLZXksIGRlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPFQ+KVxue1xuXHRjb25zdCBvbGQgPSBkZXNjcmlwdG9yLnNldDtcblx0Ly8gQHRzLWlnbm9yZVxuXHRkZXNjcmlwdG9yLnNldCA9IGZ1bmN0aW9uICh0aGlzOiBTdHJpbmdTb3VyY2VNYXAsIC4uLmFyZ3YpXG5cdHtcblx0XHRpZiAodGhpcy5sb2NrZWQpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBsb2NrZWRgKVxuXHRcdH1cblxuXHRcdHJldHVybiBvbGQuYXBwbHkodGhpcywgYXJndik7XG5cdH07XG59XG5cbmZ1bmN0aW9uIENoZWNrTG9ja2VkTWV0aG9kPFQgZXh0ZW5kcyBhbnk+KHRhcmdldDogYW55LCBwcm9wOiBJVFNQcm9wZXJ0eUtleSwgZGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8VD4pXG57XG5cdGNvbnN0IG9sZCA9IGRlc2NyaXB0b3IudmFsdWU7XG5cdC8vIEB0cy1pZ25vcmVcblx0ZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICh0aGlzOiBTdHJpbmdTb3VyY2VNYXAsIC4uLmFyZ3YpXG5cdHtcblx0XHRpZiAodGhpcy5sb2NrZWQpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBsb2NrZWRgKVxuXHRcdH1cblxuXHRcdHJldHVybiBvbGQuYXBwbHkodGhpcywgYXJndik7XG5cdH07XG5cblx0cmV0dXJuIGRlc2NyaXB0b3Jcbn1cblxuZXhwb3J0IGRlZmF1bHQgU3RyaW5nU291cmNlTWFwXG4iXX0=