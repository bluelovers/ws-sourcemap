"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineColumn = exports.splitLines = exports.generateMagicStringMap = exports.generateStringSourceMap = exports.chkChangeType = exports.diffMagicStringCore = exports.diffMagicString = exports.diffString = exports.handleInputString = exports.handleInputOptions = exports.EnumJSDiffChangeType = void 0;
const magic_string_1 = __importDefault(require("magic-string"));
const crlf_normalize_1 = __importStar(require("crlf-normalize"));
const JSDiff = __importStar(require("diff"));
const novel_1 = __importDefault(require("./diff/novel"));
var EnumJSDiffChangeType;
(function (EnumJSDiffChangeType) {
    EnumJSDiffChangeType[EnumJSDiffChangeType["NONE"] = 0] = "NONE";
    EnumJSDiffChangeType[EnumJSDiffChangeType["CONTEXT"] = 1] = "CONTEXT";
    EnumJSDiffChangeType[EnumJSDiffChangeType["ADDED"] = 2] = "ADDED";
    EnumJSDiffChangeType[EnumJSDiffChangeType["REMOVED"] = 3] = "REMOVED";
})(EnumJSDiffChangeType = exports.EnumJSDiffChangeType || (exports.EnumJSDiffChangeType = {}));
function handleInputOptions(options) {
    let { autoCRLF } = options;
    if (autoCRLF) {
        if (autoCRLF === true) {
            autoCRLF = crlf_normalize_1.LF;
        }
        options.autoCRLF = autoCRLF;
    }
    else {
        delete options.autoCRLF;
    }
    return options;
}
exports.handleInputOptions = handleInputOptions;
function handleInputString(str_old, options = {}) {
    str_old = str_old.toString();
    let { autoCRLF } = options;
    if (autoCRLF) {
        str_old = crlf_normalize_1.default(str_old, autoCRLF);
    }
    return str_old;
}
exports.handleInputString = handleInputString;
function diffString(str_old, str_new, options = {}) {
    options = handleInputOptions(options);
    str_old = handleInputString(str_old, options);
    str_new = handleInputString(str_new, options);
    let { diffFunc = novel_1.default, diffOpts } = options;
    if (diffFunc instanceof JSDiff.Diff) {
        diffFunc = diffFunc.diff.bind(diffFunc);
    }
    else if (typeof diffFunc !== 'function') {
        if (typeof JSDiff[diffFunc] === 'function') {
            diffFunc = JSDiff[diffFunc];
        }
        else {
            throw new ReferenceError(`JSDiff.${diffFunc}`);
        }
    }
    return {
        source: str_old,
        target: str_new,
        diff: diffFunc(str_old, str_new, diffOpts),
        options,
    };
}
exports.diffString = diffString;
function diffMagicString(str_old, str_new, opts = {}) {
    const { source, target, diff, options } = diffString(str_old, str_new, opts);
    let ms = new magic_string_1.default(source);
    return diffMagicStringCore({
        source,
        target,
        diff,
        options,
    }, {
        ms,
        source_idx: 0,
        deep: 0,
    });
}
exports.diffMagicString = diffMagicString;
function diffMagicStringCore(opts1, opts2) {
    const { source, target, diff, options } = opts1;
    let { ms } = opts2;
    let i = 0;
    let row;
    /*
    outputJSONSync(path.join(rootDir, 'test/temp', 'diff.json'), diff, {
        spaces: 2,
    });
     */
    while (row = diff[i]) {
        let i_now = i;
        let i_next = i + 1;
        let i_next2 = i + 2;
        let row_next = diff[i_next];
        let type_next = chkChangeType(row_next);
        let idx_next = source.indexOf(row.value, opts2.source_idx) + row.value.length;
        let throwError = true;
        if (0) {
            console.dir({
                i_now,
                row,
                row_next,
                row_next2: diff[i_next + 1],
                source_idx: opts2.source_idx,
            });
        }
        switch (chkChangeType(row)) {
            case EnumJSDiffChangeType.CONTEXT:
                throwError = false;
                opts2.source_idx = idx_next;
                break;
            case EnumJSDiffChangeType.ADDED:
                switch (type_next) {
                    case EnumJSDiffChangeType.CONTEXT:
                        ms.appendRight(opts2.source_idx, row.value);
                        throwError = false;
                        break;
                }
                break;
            case EnumJSDiffChangeType.REMOVED:
                switch (type_next) {
                    case EnumJSDiffChangeType.CONTEXT:
                    case EnumJSDiffChangeType.NONE:
                        ms.remove(opts2.source_idx, idx_next);
                        throwError = false;
                        opts2.source_idx = idx_next;
                        break;
                    case EnumJSDiffChangeType.ADDED:
                        ms.overwrite(opts2.source_idx, idx_next, row_next.value);
                        throwError = false;
                        opts2.source_idx = idx_next;
                        i++;
                        break;
                }
                break;
        }
        if (throwError) {
            throw new Error(`unknown rule`);
        }
        i++;
    }
    return {
        ms,
        source,
        target,
        diff,
        options,
    };
}
exports.diffMagicStringCore = diffMagicStringCore;
function chkChangeType(row) {
    if (!row) {
        return EnumJSDiffChangeType.NONE;
    }
    else if (row.added) {
        return EnumJSDiffChangeType.ADDED;
    }
    else if (row.removed) {
        return EnumJSDiffChangeType.REMOVED;
    }
    return EnumJSDiffChangeType.CONTEXT;
}
exports.chkChangeType = chkChangeType;
function generateStringSourceMap(str_old, str_new, options = {}) {
    const data = diffMagicString(str_old, str_new, options);
    let { sourceFile, targetFile } = data.options;
    let sourcemap = generateMagicStringMap(data.ms, data.options);
    return {
        ...data,
        sourcemap,
        sourceFile,
        targetFile,
    };
}
exports.generateStringSourceMap = generateStringSourceMap;
function generateMagicStringMap(ms, options = {}) {
    let sourceFile;
    if (typeof options === 'string') {
        sourceFile = options;
    }
    else {
        ({ sourceFile } = options);
    }
    return ms.generateMap({
        source: sourceFile,
        includeContent: true,
        hires: true,
    });
}
exports.generateMagicStringMap = generateMagicStringMap;
function splitLines(context) {
    if (typeof context !== 'string') {
        context = context.toString();
    }
    return context.split("\n");
}
exports.splitLines = splitLines;
function getLineColumn(lines, position) {
    if (!Array.isArray(lines)) {
        lines = splitLines(lines);
    }
    if (!Array.isArray(position)) {
        position = [position];
    }
    return position
        .reduce((a, options) => {
        let target_line = options.line - 1;
        let value = lines[target_line];
        if (typeof value === 'string') {
            let value_column;
            if (typeof options.column === 'number') {
                value_column = value.charAt(options.column - 1);
            }
            a.push({
                ...options,
                value,
                value_column,
            });
        }
        return a;
    }, []);
}
exports.getLineColumn = getLineColumn;
//# sourceMappingURL=util.js.map