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
    get original() {
        return this.source;
    }
    get generated() {
        return this.target;
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
    get sourceFile() {
        if (this[SymHidden].options.sourceFile == null) {
            this[SymHidden].options.sourceFile = new Date().toISOString();
        }
        return this[SymHidden].options.sourceFile;
    }
    set sourceFile(value) {
        this[SymHidden].options.sourceFile = value.toString();
    }
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
    originalPositionFor(...argv) {
        return this.smc.originalPositionFor(...argv);
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
    toUrl() {
        return this.sourcemap.toUrl();
    }
    originalLineFor(...argv) {
        let pos = this.originalPositionFor(...argv);
        return this.originalLines(pos);
    }
    _splitLines(key) {
        let key_cache = `_tmp_${key}`;
        if (!this[SymHidden][key_cache]) {
            this[SymHidden][key_cache] = util_1.splitLines(this[key]);
        }
        return this[SymHidden][key_cache];
    }
    originalLines(position) {
        return util_1.getLineColumn(this._splitLines('source'), position);
    }
    generatedLines(position) {
        return util_1.getLineColumn(this._splitLines('target'), position);
    }
    createPatch(options = {}) {
        return diff_1.createTwoFilesPatch(this.sourceFile, this.targetFile, this.original, this.generated, options.oldHeader, options.newHeader, options.patchOptions);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FLZ0I7QUFFaEIsK0JBQThGO0FBUzlGLGtEQUFpRDtBQUVqRCx3REFBZ0M7QUFDaEMsaUVBQXlDO0FBQ3pDLHlEQUFpQztBQUVqQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFRakMsTUFBYSxlQUFlO0lBZ0IzQixZQUFZLE9BQWlDLEVBQUUsR0FBRyxJQUFJO1FBZDVDLFFBQVcsR0FZakIsRUFBUyxDQUFDO1FBSWIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRVMsTUFBTTtRQUVmLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNkLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDM0I7Z0JBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQzthQUM1QjtRQUNGLENBQUMsQ0FBQyxDQUNGO0lBQ0YsQ0FBQztJQUdTLFlBQVksQ0FBQyxPQUFnQyxFQUFFLEdBQUcsSUFBSTtRQUUvRCxPQUFPLEdBQUcseUJBQWtCLENBQUM7WUFDNUIsR0FBRyxPQUFPO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFakMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3RCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxHQUFHLGVBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8s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QU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQWdCLE1BQVcsRUFBRSxJQUFvQixFQUFFLFVBQXNDO0lBRWxILE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7SUFDN0IsYUFBYTtJQUNiLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBaUMsR0FBRyxJQUFJO1FBRTFELElBQUksSUFBSSxDQUFDLE1BQU0sRUFDZjtZQUNDLE1BQU0sSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDbEM7UUFFRCxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUMsQ0FBQztJQUVGLE9BQU8sVUFBVSxDQUFBO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRJR2VuZXJhdGVTdHJpbmdTb3VyY2VNYXBPcHRpb25zLFxuXHRoYW5kbGVJbnB1dE9wdGlvbnMsXG5cdGhhbmRsZUlucHV0U3RyaW5nLFxuXHRnZW5lcmF0ZVN0cmluZ1NvdXJjZU1hcCwgZGlmZk1hZ2ljU3RyaW5nLCBnZW5lcmF0ZU1hZ2ljU3RyaW5nTWFwLCBnZXRMaW5lQ29sdW1uLCBzcGxpdExpbmVzLFxufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IE1hZ2ljU3RyaW5nLCB7IFNvdXJjZU1hcCB9IGZyb20gJ21hZ2ljLXN0cmluZyc7XG5pbXBvcnQgeyBDaGFuZ2UgYXMgSlNEaWZmQ2hhbmdlLCBjcmVhdGVQYXRjaCwgY3JlYXRlVHdvRmlsZXNQYXRjaCwgUGF0Y2hPcHRpb25zIH0gZnJvbSAnZGlmZic7XG5pbXBvcnQge1xuXHRTb3VyY2VNYXBDb25zdW1lcixcblx0U291cmNlRmluZFBvc2l0aW9uLFxuXHRGaW5kUG9zaXRpb24sXG5cdFBvc2l0aW9uLFxuXHRNYXBwZWRQb3NpdGlvbixcblx0UmF3U291cmNlTWFwLFxufSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCBjcmVhdGVTb3VyY2VNYXBDb25zdW1lclN5bmMgZnJvbSAnLi9zeW5jJztcbmltcG9ydCB7IElUU1Jlc29sdmFibGUsIElUU1BhcnRpYWxXaXRoLCBJVFNQcm9wZXJ0eUtleSwgSVRTVmFsdWVPckFycmF5IH0gZnJvbSAndHMtdHlwZSc7XG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UnO1xuXG5jb25zdCBTeW1IaWRkZW4gPSBTeW1ib2woJ3Byb3AnKTtcblxuZXhwb3J0IGludGVyZmFjZSBJU3RyaW5nU291cmNlTWFwT3B0aW9ucyBleHRlbmRzIElHZW5lcmF0ZVN0cmluZ1NvdXJjZU1hcE9wdGlvbnNcbntcblx0c291cmNlPzogc3RyaW5nIHwgQnVmZmVyLFxuXHR0YXJnZXQ/OiBzdHJpbmcgfCBCdWZmZXIsXG59XG5cbmV4cG9ydCBjbGFzcyBTdHJpbmdTb3VyY2VNYXBcbntcblx0cHJvdGVjdGVkIFtTeW1IaWRkZW5dOiB7XG5cdFx0c291cmNlOiBzdHJpbmcsXG5cdFx0dGFyZ2V0OiBzdHJpbmcsXG5cdFx0bG9ja2VkOiBib29sZWFuLFxuXHRcdG9wdGlvbnM6IElTdHJpbmdTb3VyY2VNYXBPcHRpb25zLFxuXHRcdG1zOiBNYWdpY1N0cmluZyxcblx0XHRkaWZmOiBKU0RpZmZDaGFuZ2VbXSxcblx0XHRzb3VyY2VtYXA6IFNvdXJjZU1hcCxcblx0XHRzbWM6IFNvdXJjZU1hcENvbnN1bWVyLFxuXG5cdFx0X3RtcF9zb3VyY2U6IHN0cmluZ1tdLFxuXHRcdF90bXBfdGFyZ2V0OiBzdHJpbmdbXSxcblx0fSA9IHt9IGFzIGFueTtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zPzogSVN0cmluZ1NvdXJjZU1hcE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHR0aGlzLl9jb25zdHJ1Y3RvcihvcHRpb25zLCAuLi5hcmd2KVxuXHR9XG5cblx0cHJvdGVjdGVkIF9yZXNldCgpXG5cdHtcblx0XHRPYmplY3Qua2V5cyh0aGlzW1N5bUhpZGRlbl0pXG5cdFx0XHQuZm9yRWFjaChrZXkgPT4ge1xuXHRcdFx0XHRpZiAoa2V5LnN0YXJ0c1dpdGgoJ190bXBfJykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzW1N5bUhpZGRlbl1ba2V5XSA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXHR9XG5cblx0QENoZWNrTG9ja2VkTWV0aG9kXG5cdHByb3RlY3RlZCBfY29uc3RydWN0b3Iob3B0aW9uczogSVN0cmluZ1NvdXJjZU1hcE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRvcHRpb25zID0gaGFuZGxlSW5wdXRPcHRpb25zKHtcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0fSk7XG5cblx0XHRsZXQgeyBzb3VyY2UsIHRhcmdldCB9ID0gb3B0aW9ucztcblxuXHRcdGRlbGV0ZSBvcHRpb25zLnNvdXJjZTtcblx0XHRkZWxldGUgb3B0aW9ucy50YXJnZXQ7XG5cblx0XHR0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucyA9IG1lcmdlKHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLCBvcHRpb25zKTtcblxuXHRcdGlmIChzb3VyY2UgIT0gbnVsbClcblx0XHR7XG5cdFx0XHR0aGlzLnNvdXJjZSA9IHNvdXJjZTtcblx0XHR9XG5cblx0XHRpZiAodGFyZ2V0ICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0dGhpcy50YXJnZXQgPSB0YXJnZXQ7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcmVzZXQoKTtcblxuXHRcdGxldCBfdGVtcCA9IHRoaXMuc291cmNlRmlsZTtcblxuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHRnZXQgc291cmNlKClcblx0e1xuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0uc291cmNlXG5cdH1cblxuXHRAQ2hlY2tMb2NrZWRQcm9wZXJ0eVxuXHRzZXQgc291cmNlKHZhbHVlOiBzdHJpbmcgfCBCdWZmZXIpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0uc291cmNlID0gaGFuZGxlSW5wdXRTdHJpbmcodmFsdWUsIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zKTtcblx0fVxuXG5cdGdldCBsb2NrZWQoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNbU3ltSGlkZGVuXSAmJiB0aGlzW1N5bUhpZGRlbl0ubG9ja2VkXG5cdH1cblxuXHRnZXQgdGFyZ2V0KClcblx0e1xuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0udGFyZ2V0XG5cdH1cblxuXHRAQ2hlY2tMb2NrZWRQcm9wZXJ0eVxuXHRzZXQgdGFyZ2V0KHZhbHVlOiBzdHJpbmcgfCBCdWZmZXIpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0udGFyZ2V0ID0gaGFuZGxlSW5wdXRTdHJpbmcodmFsdWUsIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zKTtcblx0fVxuXG5cdGdldCBvcmlnaW5hbCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5zb3VyY2UgYXMgc3RyaW5nXG5cdH1cblxuXHRnZXQgZ2VuZXJhdGVkKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnRhcmdldCBhcyBzdHJpbmdcblx0fVxuXG5cdGdldCBzb3VyY2VtYXAoKVxuXHR7XG5cdFx0aWYgKHRoaXNbU3ltSGlkZGVuXS5zb3VyY2VtYXAgPT0gbnVsbCAmJiB0aGlzLmxvY2tlZClcblx0XHR7XG5cdFx0XHR0aGlzW1N5bUhpZGRlbl0uc291cmNlbWFwID0gZ2VuZXJhdGVNYWdpY1N0cmluZ01hcCh0aGlzW1N5bUhpZGRlbl0ubXMsIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zKVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0uc291cmNlbWFwXG5cdH1cblxuXHQvKipcblx0ICogU291cmNlTWFwQ29uc3VtZXJcblx0ICpcblx0ICogQHJldHVybnMge1NvdXJjZU1hcENvbnN1bWVyfVxuXHQgKi9cblx0Z2V0IHNtYygpOiBTb3VyY2VNYXBDb25zdW1lclxuXHR7XG5cdFx0aWYgKHRoaXNbU3ltSGlkZGVuXS5zbWMgPT0gbnVsbCAmJiB0aGlzLmxvY2tlZClcblx0XHR7XG5cdFx0XHR0aGlzW1N5bUhpZGRlbl0uc21jID0gY3JlYXRlU291cmNlTWFwQ29uc3VtZXJTeW5jKHRoaXMuc291cmNlbWFwKVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzW1N5bUhpZGRlbl0uc21jXG5cdH1cblxuXHRnZXQgc291cmNlRmlsZSgpXG5cdHtcblx0XHRpZiAodGhpc1tTeW1IaWRkZW5dLm9wdGlvbnMuc291cmNlRmlsZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnNvdXJjZUZpbGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnNvdXJjZUZpbGVcblx0fVxuXG5cdEBDaGVja0xvY2tlZFByb3BlcnR5XG5cdHNldCBzb3VyY2VGaWxlKHZhbHVlOiBzdHJpbmcpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucy5zb3VyY2VGaWxlID0gdmFsdWUudG9TdHJpbmcoKVxuXHR9XG5cblx0Z2V0IHRhcmdldEZpbGUoKVxuXHR7XG5cdFx0aWYgKHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnRhcmdldEZpbGUgPT0gbnVsbClcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5zb3VyY2VGaWxlXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXNbU3ltSGlkZGVuXS5vcHRpb25zLnRhcmdldEZpbGVcblx0fVxuXG5cdEBDaGVja0xvY2tlZFByb3BlcnR5XG5cdHNldCB0YXJnZXRGaWxlKHZhbHVlOiBzdHJpbmcpXG5cdHtcblx0XHR0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucy50YXJnZXRGaWxlID0gdmFsdWUudG9TdHJpbmcoKVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPquWFgeioseWft+ihjOS4gOasoe+8jOWft+ihjOW+jOacg+mOluWumuaLkue1leabtOaUueWxrOaAp1xuXHQgKi9cblx0QENoZWNrTG9ja2VkTWV0aG9kXG5cdHByb2Nlc3Mob3B0aW9ucz86IElTdHJpbmdTb3VyY2VNYXBPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0dGhpcy5fY29uc3RydWN0b3Iob3B0aW9ucywgLi4uYXJndik7XG5cblx0XHRpZiAodGhpcy5zb3VyY2UgPT0gbnVsbCB8fCB0aGlzLnRhcmdldCA9PSBudWxsKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYHNvdXJjZSBvciB0YXJnZXQgaXMgdW5kZWZpbmVkYClcblx0XHR9XG5cblx0XHR0aGlzW1N5bUhpZGRlbl0ubG9ja2VkID0gdHJ1ZTtcblxuXHRcdGxldCB7IG1zLCBkaWZmIH0gPSBkaWZmTWFnaWNTdHJpbmcodGhpcy5zb3VyY2UsIHRoaXMudGFyZ2V0LCB0aGlzW1N5bUhpZGRlbl0ub3B0aW9ucyk7XG5cblx0XHR0aGlzW1N5bUhpZGRlbl0ubXMgPSBtcztcblx0XHR0aGlzW1N5bUhpZGRlbl0uZGlmZiA9IGRpZmY7XG5cblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHJvY2Vzc0ZvcmNlKG9wdGlvbnM/OiBJU3RyaW5nU291cmNlTWFwT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHRoaXNbU3ltSGlkZGVuXS5sb2NrZWQgPSBmYWxzZTtcblx0XHRyZXR1cm4gdGhpcy5wcm9jZXNzKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0ZGVzdHJveSgpXG5cdHtcblx0XHR0aGlzLl9yZXNldCgpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlmICh0aGlzLnNtYyAmJiB0aGlzLnNtYy5kZXN0cm95KVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRoaXMuc21jLmRlc3Ryb3koKTtcblx0XHR9XG5cblx0XHRPYmplY3Qua2V5cyh0aGlzW1N5bUhpZGRlbl0pXG5cdFx0XHQuZm9yRWFjaChrID0+IGRlbGV0ZSB0aGlzW1N5bUhpZGRlbl1ba10pXG5cdFx0O1xuXG5cdFx0dGhpc1tTeW1IaWRkZW5dLmxvY2tlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGZha2VUaGVuPFIgZXh0ZW5kcyBhbnk+KGNiOiAodGhpczogdGhpcywgb2JqOiB0aGlzKSA9PiBJVFNSZXNvbHZhYmxlPFI+KVxuXHR7XG5cdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHQucmVzb2x2ZSh0aGlzKVxuXHRcdFx0LmJpbmQodGhpcylcblx0XHRcdC50aGVuKGNiKVxuXHRcdFx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOW+niB0YXJnZXQg55qE6KGM5YiX5L2N572u5L6G5Y+N5p+l5ZyoIHNvdXJjZSDlhafnmoTljp/lp4vkvY3nva5cblx0ICovXG5cdG9yaWdpbmFsUG9zaXRpb25Gb3IoLi4uYXJndjogUGFyYW1ldGVyczxTb3VyY2VNYXBDb25zdW1lcltcIm9yaWdpbmFsUG9zaXRpb25Gb3JcIl0+KVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuc21jLm9yaWdpbmFsUG9zaXRpb25Gb3IoLi4uYXJndilcblx0fVxuXG5cdC8qKlxuXHQgKiDlvp4gc291cmNlIOWFp+eahOWOn+Wni+S9jee9ruS+huafpeipouWcqCB0YXJnZXQg55qE6KGM5YiX5L2N572uXG5cdCAqL1xuXHRnZW5lcmF0ZWRQb3NpdGlvbkZvcihvcmlnaW5hbFBvc2l0aW9uOiBJVFNQYXJ0aWFsV2l0aDxTb3VyY2VGaW5kUG9zaXRpb24sICdzb3VyY2UnPilcblx0e1xuXHRcdGlmIChvcmlnaW5hbFBvc2l0aW9uLnNvdXJjZSA9PSBudWxsKVxuXHRcdHtcblx0XHRcdG9yaWdpbmFsUG9zaXRpb24uc291cmNlID0gdGhpcy5zb3VyY2VGaWxlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnNtYy5nZW5lcmF0ZWRQb3NpdGlvbkZvcihvcmlnaW5hbFBvc2l0aW9uIGFzIFNvdXJjZUZpbmRQb3NpdGlvbilcblx0fVxuXG5cdGFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvcihvcmlnaW5hbFBvc2l0aW9uOiBJVFNQYXJ0aWFsV2l0aDxNYXBwZWRQb3NpdGlvbiwgJ3NvdXJjZSc+KVxuXHR7XG5cdFx0aWYgKG9yaWdpbmFsUG9zaXRpb24uc291cmNlID09IG51bGwpXG5cdFx0e1xuXHRcdFx0b3JpZ2luYWxQb3NpdGlvbi5zb3VyY2UgPSB0aGlzLnNvdXJjZUZpbGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuc21jLmFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvcihvcmlnaW5hbFBvc2l0aW9uIGFzIE1hcHBlZFBvc2l0aW9uKVxuXHR9XG5cblx0dG9KU09OKCk6IFJhd1NvdXJjZU1hcFxuXHR7XG5cdFx0bGV0IHtcblx0XHRcdHZlcnNpb24sXG5cdFx0XHRmaWxlLFxuXHRcdFx0c291cmNlcyxcblx0XHRcdHNvdXJjZXNDb250ZW50LFxuXHRcdFx0bWFwcGluZ3MsXG5cdFx0XHRuYW1lcyxcblx0XHR9ID0gdGhpcy5zb3VyY2VtYXA7XG5cblx0XHRyZXR1cm4gY2xvbmVEZWVwKHtcblx0XHRcdHZlcnNpb246IHZlcnNpb24udG9TdHJpbmcoKSxcblx0XHRcdGZpbGUsXG5cdFx0XHRzb3VyY2VzLFxuXHRcdFx0c291cmNlc0NvbnRlbnQsXG5cdFx0XHRtYXBwaW5ncyxcblx0XHRcdG5hbWVzLFxuXHRcdH0pXG5cdH1cblxuXHR0b1N0cmluZygpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5zb3VyY2VtYXAudG9TdHJpbmcoKVxuXHR9XG5cblx0dG9VcmwoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuc291cmNlbWFwLnRvVXJsKClcblx0fVxuXG5cdG9yaWdpbmFsTGluZUZvciguLi5hcmd2OiBQYXJhbWV0ZXJzPFN0cmluZ1NvdXJjZU1hcFtcIm9yaWdpbmFsUG9zaXRpb25Gb3JcIl0+KVxuXHR7XG5cdFx0bGV0IHBvcyA9IHRoaXMub3JpZ2luYWxQb3NpdGlvbkZvciguLi5hcmd2KTtcblxuXHRcdHJldHVybiB0aGlzLm9yaWdpbmFsTGluZXMocG9zKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3BsaXRMaW5lcyhrZXk6ICdzb3VyY2UnIHwgJ3RhcmdldCcpXG5cdHtcblx0XHRsZXQga2V5X2NhY2hlID0gYF90bXBfJHtrZXl9YDtcblxuXHRcdGlmICghdGhpc1tTeW1IaWRkZW5dW2tleV9jYWNoZV0pXG5cdFx0e1xuXHRcdFx0dGhpc1tTeW1IaWRkZW5dW2tleV9jYWNoZV0gPSBzcGxpdExpbmVzKHRoaXNba2V5XSlcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpc1tTeW1IaWRkZW5dW2tleV9jYWNoZV1cblx0fVxuXG5cdG9yaWdpbmFsTGluZXM8VCBleHRlbmRzIFBvc2l0aW9uPihwb3NpdGlvbjogSVRTVmFsdWVPckFycmF5PElUU1BhcnRpYWxXaXRoPFQsICdjb2x1bW4nPj4pXG5cdHtcblx0XHRyZXR1cm4gZ2V0TGluZUNvbHVtbih0aGlzLl9zcGxpdExpbmVzKCdzb3VyY2UnKSwgcG9zaXRpb24pXG5cdH1cblxuXHRnZW5lcmF0ZWRMaW5lczxUIGV4dGVuZHMgUG9zaXRpb24+KHBvc2l0aW9uOiBJVFNWYWx1ZU9yQXJyYXk8SVRTUGFydGlhbFdpdGg8VCwgJ2NvbHVtbic+Pilcblx0e1xuXHRcdHJldHVybiBnZXRMaW5lQ29sdW1uKHRoaXMuX3NwbGl0TGluZXMoJ3RhcmdldCcpLCBwb3NpdGlvbilcblx0fVxuXG5cdGNyZWF0ZVBhdGNoKG9wdGlvbnM6IElQYXRjaE9wdGlvbnMgPSB7fSlcblx0e1xuXHRcdHJldHVybiBjcmVhdGVUd29GaWxlc1BhdGNoKHRoaXMuc291cmNlRmlsZSwgdGhpcy50YXJnZXRGaWxlLCB0aGlzLm9yaWdpbmFsLCB0aGlzLmdlbmVyYXRlZCwgb3B0aW9ucy5vbGRIZWFkZXIsIG9wdGlvbnMubmV3SGVhZGVyLCBvcHRpb25zLnBhdGNoT3B0aW9ucylcblx0fVxuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhdGNoT3B0aW9uc1xue1xuXHRvbGRIZWFkZXI/OiBzdHJpbmcsXG5cdG5ld0hlYWRlcj86IHN0cmluZyxcblx0cGF0Y2hPcHRpb25zPzogUGF0Y2hPcHRpb25zLFxufVxuXG5mdW5jdGlvbiBDaGVja0xvY2tlZFByb3BlcnR5PFQgZXh0ZW5kcyBhbnk+KHRhcmdldDogYW55LCBwcm9wOiBJVFNQcm9wZXJ0eUtleSwgZGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8VD4pXG57XG5cdGNvbnN0IG9sZCA9IGRlc2NyaXB0b3Iuc2V0O1xuXHQvLyBAdHMtaWdub3JlXG5cdGRlc2NyaXB0b3Iuc2V0ID0gZnVuY3Rpb24gKHRoaXM6IFN0cmluZ1NvdXJjZU1hcCwgLi4uYXJndilcblx0e1xuXHRcdGlmICh0aGlzLmxvY2tlZClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYGxvY2tlZGApXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9sZC5hcHBseSh0aGlzLCBhcmd2KTtcblx0fTtcbn1cblxuZnVuY3Rpb24gQ2hlY2tMb2NrZWRNZXRob2Q8VCBleHRlbmRzIGFueT4odGFyZ2V0OiBhbnksIHByb3A6IElUU1Byb3BlcnR5S2V5LCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxUPilcbntcblx0Y29uc3Qgb2xkID0gZGVzY3JpcHRvci52YWx1ZTtcblx0Ly8gQHRzLWlnbm9yZVxuXHRkZXNjcmlwdG9yLnZhbHVlID0gZnVuY3Rpb24gKHRoaXM6IFN0cmluZ1NvdXJjZU1hcCwgLi4uYXJndilcblx0e1xuXHRcdGlmICh0aGlzLmxvY2tlZClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYGxvY2tlZGApXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9sZC5hcHBseSh0aGlzLCBhcmd2KTtcblx0fTtcblxuXHRyZXR1cm4gZGVzY3JpcHRvclxufVxuIl19