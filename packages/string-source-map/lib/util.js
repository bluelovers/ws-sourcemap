"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsZ0VBQXNEO0FBQ3RELGlFQUFvRDtBQUVwRCw2Q0FBK0I7QUFhL0IseURBQTBDO0FBRTFDLElBQVksb0JBTVg7QUFORCxXQUFZLG9CQUFvQjtJQUUvQiwrREFBSSxDQUFBO0lBQ0oscUVBQU8sQ0FBQTtJQUNQLGlFQUFLLENBQUE7SUFDTCxxRUFBTyxDQUFBO0FBQ1IsQ0FBQyxFQU5XLG9CQUFvQixHQUFwQiw0QkFBb0IsS0FBcEIsNEJBQW9CLFFBTS9CO0FBRUQsU0FBZ0Isa0JBQWtCLENBQStCLE9BQVU7SUFFMUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUUzQixJQUFJLFFBQVEsRUFDWjtRQUNDLElBQUksUUFBUSxLQUFLLElBQUksRUFDckI7WUFDQyxRQUFRLEdBQUcsbUJBQUUsQ0FBQztTQUNkO1FBRUQsT0FBTyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7S0FDNUI7U0FFRDtRQUNDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQTtLQUN2QjtJQUVELE9BQU8sT0FBTyxDQUFBO0FBQ2YsQ0FBQztBQW5CRCxnREFtQkM7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxPQUF3QixFQUFFLFVBQThCLEVBQUU7SUFFM0YsT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUU3QixJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTNCLElBQUksUUFBUSxFQUNaO1FBQ0MsT0FBTyxHQUFHLHdCQUFJLENBQUMsT0FBTyxFQUFFLFFBQWUsQ0FBQyxDQUFDO0tBQ3pDO0lBRUQsT0FBTyxPQUFPLENBQUE7QUFDZixDQUFDO0FBWkQsOENBWUM7QUE0QkQsU0FBZ0IsVUFBVSxDQUErQixPQUF3QixFQUNoRixPQUF3QixFQUN4QixVQUFhLEVBQVM7SUFHdEIsT0FBTyxHQUFHLGtCQUFrQixDQUFJLE9BQU8sQ0FBQyxDQUFDO0lBRXpDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUU5QyxJQUFJLEVBQUUsUUFBUSxHQUFHLGVBQWMsRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdEQsSUFBSSxRQUFRLFlBQVksTUFBTSxDQUFDLElBQUksRUFDbkM7UUFDQyxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDeEM7U0FDSSxJQUFJLE9BQU8sUUFBUSxLQUFLLFVBQVUsRUFDdkM7UUFDQyxJQUFJLE9BQU8sTUFBTSxDQUFDLFFBQW1DLENBQUMsS0FBSyxVQUFVLEVBQ3JFO1lBQ0MsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFtQyxDQUFrQixDQUFBO1NBQ3ZFO2FBRUQ7WUFDQyxNQUFNLElBQUksY0FBYyxDQUFDLFVBQVUsUUFBUSxFQUFFLENBQUMsQ0FBQTtTQUM5QztLQUNEO0lBRUQsT0FBTztRQUNOLE1BQU0sRUFBRSxPQUFPO1FBQ2YsTUFBTSxFQUFFLE9BQU87UUFDZixJQUFJLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDO1FBQzFDLE9BQU87S0FDUCxDQUFBO0FBQ0YsQ0FBQztBQWxDRCxnQ0FrQ0M7QUFFRCxTQUFnQixlQUFlLENBQStCLE9BQXdCLEVBQ3JGLE9BQXdCLEVBQ3hCLE9BQVUsRUFBUztJQUduQixNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFJLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFaEYsSUFBSSxFQUFFLEdBQUcsSUFBSSxzQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRWpDLE9BQU8sbUJBQW1CLENBQUk7UUFDN0IsTUFBTTtRQUNOLE1BQU07UUFDTixJQUFJO1FBQ0osT0FBTztLQUNQLEVBQUU7UUFDRixFQUFFO1FBQ0YsVUFBVSxFQUFFLENBQUM7UUFDYixJQUFJLEVBQUUsQ0FBQztLQUNQLENBQUMsQ0FBQTtBQUNILENBQUM7QUFuQkQsMENBbUJDO0FBRUQsU0FBZ0IsbUJBQW1CLENBQStCLEtBQTJCLEVBQUUsS0FJOUY7SUFFQSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDO0lBQ2hELElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFFbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxHQUFpQixDQUFDO0lBRXRCOzs7O09BSUc7SUFFSCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ3BCO1FBQ0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixJQUFJLFNBQVMsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFeEMsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUU5RSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFFdEIsSUFBSSxDQUFDLEVBQ0w7WUFDQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNYLEtBQUs7Z0JBQ0wsR0FBRztnQkFDSCxRQUFRO2dCQUNSLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDM0IsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO2FBQzVCLENBQUMsQ0FBQztTQUNIO1FBRUQsUUFBUSxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQzFCO1lBQ0MsS0FBSyxvQkFBb0IsQ0FBQyxPQUFPO2dCQUVoQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUVuQixLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztnQkFDNUIsTUFBTTtZQUNQLEtBQUssb0JBQW9CLENBQUMsS0FBSztnQkFFOUIsUUFBUSxTQUFTLEVBQ2pCO29CQUNDLEtBQUssb0JBQW9CLENBQUMsT0FBTzt3QkFFaEMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFFNUMsVUFBVSxHQUFHLEtBQUssQ0FBQzt3QkFFbkIsTUFBTTtpQkFDUDtnQkFFRCxNQUFNO1lBRVAsS0FBSyxvQkFBb0IsQ0FBQyxPQUFPO2dCQUVoQyxRQUFRLFNBQVMsRUFDakI7b0JBQ0MsS0FBSyxvQkFBb0IsQ0FBQyxPQUFPLENBQUM7b0JBQ2xDLEtBQUssb0JBQW9CLENBQUMsSUFBSTt3QkFDN0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUV0QyxVQUFVLEdBQUcsS0FBSyxDQUFDO3dCQUVuQixLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQzt3QkFDNUIsTUFBTTtvQkFDUCxLQUFLLG9CQUFvQixDQUFDLEtBQUs7d0JBRTlCLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUV6RCxVQUFVLEdBQUcsS0FBSyxDQUFDO3dCQUVuQixLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQzt3QkFFNUIsQ0FBQyxFQUFFLENBQUM7d0JBRUosTUFBTTtpQkFDUDtnQkFFRCxNQUFNO1NBQ1A7UUFFRCxJQUFJLFVBQVUsRUFDZDtZQUNDLE1BQU0sSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUE7U0FDL0I7UUFFRCxDQUFDLEVBQUUsQ0FBQztLQUNKO0lBRUQsT0FBTztRQUNOLEVBQUU7UUFDRixNQUFNO1FBQ04sTUFBTTtRQUNOLElBQUk7UUFDSixPQUFPO0tBQ1AsQ0FBQTtBQUNGLENBQUM7QUE1R0Qsa0RBNEdDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEdBQWlCO0lBRTlDLElBQUksQ0FBQyxHQUFHLEVBQ1I7UUFDQyxPQUFPLG9CQUFvQixDQUFDLElBQUksQ0FBQTtLQUNoQztTQUNJLElBQUksR0FBRyxDQUFDLEtBQUssRUFDbEI7UUFDQyxPQUFPLG9CQUFvQixDQUFDLEtBQUssQ0FBQTtLQUNqQztTQUNJLElBQUksR0FBRyxDQUFDLE9BQU8sRUFDcEI7UUFDQyxPQUFPLG9CQUFvQixDQUFDLE9BQU8sQ0FBQTtLQUNuQztJQUVELE9BQU8sb0JBQW9CLENBQUMsT0FBTyxDQUFBO0FBQ3BDLENBQUM7QUFoQkQsc0NBZ0JDO0FBUUQsU0FBZ0IsdUJBQXVCLENBQTRDLE9BQXdCLEVBQzFHLE9BQXdCLEVBQ3hCLFVBQWEsRUFBUztJQUd0QixNQUFNLElBQUksR0FBRyxlQUFlLENBQUksT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUUzRCxJQUFJLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFFOUMsSUFBSSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFOUQsT0FBTztRQUNOLEdBQUcsSUFBSTtRQUNQLFNBQVM7UUFDVCxVQUFVO1FBQ1YsVUFBVTtLQUNWLENBQUE7QUFDRixDQUFDO0FBakJELDBEQWlCQztBQUVELFNBQWdCLHNCQUFzQixDQUE0QyxFQUFlLEVBQ2hHLFVBQXNCLEVBQVM7SUFHL0IsSUFBSSxVQUFrQixDQUFDO0lBRXZCLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUMvQjtRQUNDLFVBQVUsR0FBRyxPQUFPLENBQUM7S0FDckI7U0FFRDtRQUNDLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQztLQUMzQjtJQUVELE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUNyQixNQUFNLEVBQUUsVUFBVTtRQUNsQixjQUFjLEVBQUUsSUFBSTtRQUNwQixLQUFLLEVBQUUsSUFBSTtLQUNYLENBQUMsQ0FBQTtBQUNILENBQUM7QUFwQkQsd0RBb0JDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLE9BQXdCO0lBRWxELElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUMvQjtRQUNDLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDN0I7SUFFRCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDM0IsQ0FBQztBQVJELGdDQVFDO0FBRUQsU0FBZ0IsYUFBYSxDQUFxQixLQUF3QixFQUN6RSxRQUFzRDtJQUd0RCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDekI7UUFDQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzFCO0lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQzVCO1FBQ0MsUUFBUSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDdEI7SUFFRCxPQUFPLFFBQVE7U0FDYixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFFdEIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFFbkMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRS9CLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUM3QjtZQUNDLElBQUksWUFBb0IsQ0FBQztZQUV6QixJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQ3RDO2dCQUNDLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7YUFDL0M7WUFFRCxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNOLEdBQUcsT0FBTztnQkFDVixLQUFLO2dCQUNMLFlBQVk7YUFDWixDQUFDLENBQUE7U0FDRjtRQUVELE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQyxFQUFFLEVBRUMsQ0FBQyxDQUNKO0FBQ0gsQ0FBQztBQTFDRCxzQ0EwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkaWZmQ2hhcnMsIGRpZmZXb3JkcywgZGlmZldvcmRzV2l0aFNwYWNlIH0gZnJvbSAnZGlmZic7XG5pbXBvcnQgTWFnaWNTdHJpbmcsIHsgU291cmNlTWFwIH0gZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCBjcmxmLCB7IENSLCBDUkxGLCBMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCB7IENoYW5nZSBhcyBKU0RpZmZDaGFuZ2UgfSBmcm9tICdkaWZmJztcbmltcG9ydCAqIGFzIEpTRGlmZiBmcm9tICdkaWZmJztcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuXHRJVFNQYXJ0aWFsV2l0aCxcblx0SVRTVmFsdWVPckFycmF5LFxuXHRJVFNFeHRyYWN0UmVjb3JkLFxuXHRJVFNWYWx1ZU9mLFxuXHRJVFNLZXlPZixcblx0SVRTRXh0cmFjdEtleW9mUmVjb3JkLFxufSBmcm9tICd0cy10eXBlJztcbmltcG9ydCB7IG91dHB1dEZpbGVTeW5jLCBvdXRwdXRKU09OU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgcm9vdERpciB9IGZyb20gJy4uL3Rlc3QvX2xvY2FsLWRldic7XG5pbXBvcnQgZGlmZk5vdmVsQ2hhcnMgZnJvbSAnLi9kaWZmL25vdmVsJztcblxuZXhwb3J0IGVudW0gRW51bUpTRGlmZkNoYW5nZVR5cGVcbntcblx0Tk9ORSxcblx0Q09OVEVYVCxcblx0QURERUQsXG5cdFJFTU9WRUQsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVJbnB1dE9wdGlvbnM8VCBleHRlbmRzIElEaWZmU3RyaW5nT3B0aW9ucz4ob3B0aW9uczogVCk6IFRcbntcblx0bGV0IHsgYXV0b0NSTEYgfSA9IG9wdGlvbnM7XG5cblx0aWYgKGF1dG9DUkxGKVxuXHR7XG5cdFx0aWYgKGF1dG9DUkxGID09PSB0cnVlKVxuXHRcdHtcblx0XHRcdGF1dG9DUkxGID0gTEY7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucy5hdXRvQ1JMRiA9IGF1dG9DUkxGO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGRlbGV0ZSBvcHRpb25zLmF1dG9DUkxGXG5cdH1cblxuXHRyZXR1cm4gb3B0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlSW5wdXRTdHJpbmcoc3RyX29sZDogQnVmZmVyIHwgc3RyaW5nLCBvcHRpb25zOiBJRGlmZlN0cmluZ09wdGlvbnMgPSB7fSlcbntcblx0c3RyX29sZCA9IHN0cl9vbGQudG9TdHJpbmcoKTtcblxuXHRsZXQgeyBhdXRvQ1JMRiB9ID0gb3B0aW9ucztcblxuXHRpZiAoYXV0b0NSTEYpXG5cdHtcblx0XHRzdHJfb2xkID0gY3JsZihzdHJfb2xkLCBhdXRvQ1JMRiBhcyBhbnkpO1xuXHR9XG5cblx0cmV0dXJuIHN0cl9vbGRcbn1cblxuZXhwb3J0IHR5cGUgSUpTRGlmZk1ldGhvZCA9IElUU0V4dHJhY3RSZWNvcmQ8dHlwZW9mIEpTRGlmZiwgSUpTRGlmZkZuTGlrZT47XG5cbmV4cG9ydCB0eXBlIElKU0RpZmZGbkxpa2UgPSAoKG9sZFN0cjogc3RyaW5nLCBuZXdTdHI6IHN0cmluZywgb3B0aW9ucz86IEpTRGlmZi5CYXNlT3B0aW9ucykgPT4gSlNEaWZmQ2hhbmdlW10pO1xuXG5leHBvcnQgdHlwZSBJRGlmZlN0cmluZ0ZuID0gSVRTS2V5T2Y8SUpTRGlmZk1ldGhvZD4gfCBJSlNEaWZmTWV0aG9kIHwgSUpTRGlmZkZuTGlrZSB8IEpTRGlmZi5EaWZmXG5cbmV4cG9ydCBpbnRlcmZhY2UgSURpZmZTdHJpbmdPcHRpb25zXG57XG5cdGF1dG9DUkxGPzogdHlwZW9mIENSIHwgdHlwZW9mIENSTEYgfCB0eXBlb2YgTEYgfCB0cnVlO1xuXG5cdC8qKlxuXHQgKiDlhYHoqLHmm7Tmj5sgZGlmZiDliIbmnpDlh73mlbjvvIzkvYbnhKHms5Xkv53orYnmraPluLjpgYvkvZxcblx0ICog6aCQ6Kit54K6XG5cdCAqL1xuXHRkaWZmRnVuYz86IElEaWZmU3RyaW5nRm4sXG5cdGRpZmZPcHRzPzogSlNEaWZmLkJhc2VPcHRpb25zICYgb2JqZWN0LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElEaWZmU3RyaW5nUmV0dXJuPE8gZXh0ZW5kcyBJRGlmZlN0cmluZ09wdGlvbnM+XG57XG5cdHNvdXJjZTogc3RyaW5nO1xuXHR0YXJnZXQ6IHN0cmluZztcblx0ZGlmZjogSlNEaWZmQ2hhbmdlW107XG5cdG9wdGlvbnM6IE87XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmU3RyaW5nPE8gZXh0ZW5kcyBJRGlmZlN0cmluZ09wdGlvbnM+KHN0cl9vbGQ6IEJ1ZmZlciB8IHN0cmluZyxcblx0c3RyX25ldzogQnVmZmVyIHwgc3RyaW5nLFxuXHRvcHRpb25zOiBPID0ge30gYXMgYW55LFxuKTogSURpZmZTdHJpbmdSZXR1cm48Tz5cbntcblx0b3B0aW9ucyA9IGhhbmRsZUlucHV0T3B0aW9uczxPPihvcHRpb25zKTtcblxuXHRzdHJfb2xkID0gaGFuZGxlSW5wdXRTdHJpbmcoc3RyX29sZCwgb3B0aW9ucyk7XG5cdHN0cl9uZXcgPSBoYW5kbGVJbnB1dFN0cmluZyhzdHJfbmV3LCBvcHRpb25zKTtcblxuXHRsZXQgeyBkaWZmRnVuYyA9IGRpZmZOb3ZlbENoYXJzLCBkaWZmT3B0cyB9ID0gb3B0aW9ucztcblxuXHRpZiAoZGlmZkZ1bmMgaW5zdGFuY2VvZiBKU0RpZmYuRGlmZilcblx0e1xuXHRcdGRpZmZGdW5jID0gZGlmZkZ1bmMuZGlmZi5iaW5kKGRpZmZGdW5jKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGlmZkZ1bmMgIT09ICdmdW5jdGlvbicpXG5cdHtcblx0XHRpZiAodHlwZW9mIEpTRGlmZltkaWZmRnVuYyBhcyBJVFNLZXlPZjxJSlNEaWZmTWV0aG9kPl0gPT09ICdmdW5jdGlvbicpXG5cdFx0e1xuXHRcdFx0ZGlmZkZ1bmMgPSBKU0RpZmZbZGlmZkZ1bmMgYXMgSVRTS2V5T2Y8SUpTRGlmZk1ldGhvZD5dIGFzIElKU0RpZmZGbkxpa2Vcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgSlNEaWZmLiR7ZGlmZkZ1bmN9YClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNvdXJjZTogc3RyX29sZCxcblx0XHR0YXJnZXQ6IHN0cl9uZXcsXG5cdFx0ZGlmZjogZGlmZkZ1bmMoc3RyX29sZCwgc3RyX25ldywgZGlmZk9wdHMpLFxuXHRcdG9wdGlvbnMsXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZNYWdpY1N0cmluZzxPIGV4dGVuZHMgSURpZmZTdHJpbmdPcHRpb25zPihzdHJfb2xkOiBCdWZmZXIgfCBzdHJpbmcsXG5cdHN0cl9uZXc6IEJ1ZmZlciB8IHN0cmluZyxcblx0b3B0czogTyA9IHt9IGFzIGFueSxcbilcbntcblx0Y29uc3QgeyBzb3VyY2UsIHRhcmdldCwgZGlmZiwgb3B0aW9ucyB9ID0gZGlmZlN0cmluZzxPPihzdHJfb2xkLCBzdHJfbmV3LCBvcHRzKTtcblxuXHRsZXQgbXMgPSBuZXcgTWFnaWNTdHJpbmcoc291cmNlKTtcblxuXHRyZXR1cm4gZGlmZk1hZ2ljU3RyaW5nQ29yZTxPPih7XG5cdFx0c291cmNlLFxuXHRcdHRhcmdldCxcblx0XHRkaWZmLFxuXHRcdG9wdGlvbnMsXG5cdH0sIHtcblx0XHRtcyxcblx0XHRzb3VyY2VfaWR4OiAwLFxuXHRcdGRlZXA6IDAsXG5cdH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWZmTWFnaWNTdHJpbmdDb3JlPE8gZXh0ZW5kcyBJRGlmZlN0cmluZ09wdGlvbnM+KG9wdHMxOiBJRGlmZlN0cmluZ1JldHVybjxPPiwgb3B0czI6IHtcblx0bXM6IE1hZ2ljU3RyaW5nLFxuXHRzb3VyY2VfaWR4OiBudW1iZXIsXG5cdGRlZXA6IG51bWJlcixcbn0pXG57XG5cdGNvbnN0IHsgc291cmNlLCB0YXJnZXQsIGRpZmYsIG9wdGlvbnMgfSA9IG9wdHMxO1xuXHRsZXQgeyBtcyB9ID0gb3B0czI7XG5cblx0bGV0IGkgPSAwO1xuXHRsZXQgcm93OiBKU0RpZmZDaGFuZ2U7XG5cblx0Lypcblx0b3V0cHV0SlNPTlN5bmMocGF0aC5qb2luKHJvb3REaXIsICd0ZXN0L3RlbXAnLCAnZGlmZi5qc29uJyksIGRpZmYsIHtcblx0XHRzcGFjZXM6IDIsXG5cdH0pO1xuXHQgKi9cblxuXHR3aGlsZSAocm93ID0gZGlmZltpXSlcblx0e1xuXHRcdGxldCBpX25vdyA9IGk7XG5cdFx0bGV0IGlfbmV4dCA9IGkgKyAxO1xuXHRcdGxldCBpX25leHQyID0gaSArIDI7XG5cblx0XHRsZXQgcm93X25leHQgPSBkaWZmW2lfbmV4dF07XG5cdFx0bGV0IHR5cGVfbmV4dCA9IGNoa0NoYW5nZVR5cGUocm93X25leHQpO1xuXG5cdFx0bGV0IGlkeF9uZXh0ID0gc291cmNlLmluZGV4T2Yocm93LnZhbHVlLCBvcHRzMi5zb3VyY2VfaWR4KSArIHJvdy52YWx1ZS5sZW5ndGg7XG5cblx0XHRsZXQgdGhyb3dFcnJvciA9IHRydWU7XG5cblx0XHRpZiAoMClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmRpcih7XG5cdFx0XHRcdGlfbm93LFxuXHRcdFx0XHRyb3csXG5cdFx0XHRcdHJvd19uZXh0LFxuXHRcdFx0XHRyb3dfbmV4dDI6IGRpZmZbaV9uZXh0ICsgMV0sXG5cdFx0XHRcdHNvdXJjZV9pZHg6IG9wdHMyLnNvdXJjZV9pZHgsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKGNoa0NoYW5nZVR5cGUocm93KSlcblx0XHR7XG5cdFx0XHRjYXNlIEVudW1KU0RpZmZDaGFuZ2VUeXBlLkNPTlRFWFQ6XG5cblx0XHRcdFx0dGhyb3dFcnJvciA9IGZhbHNlO1xuXG5cdFx0XHRcdG9wdHMyLnNvdXJjZV9pZHggPSBpZHhfbmV4dDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEVudW1KU0RpZmZDaGFuZ2VUeXBlLkFEREVEOlxuXG5cdFx0XHRcdHN3aXRjaCAodHlwZV9uZXh0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FzZSBFbnVtSlNEaWZmQ2hhbmdlVHlwZS5DT05URVhUOlxuXG5cdFx0XHRcdFx0XHRtcy5hcHBlbmRSaWdodChvcHRzMi5zb3VyY2VfaWR4LCByb3cudmFsdWUpO1xuXG5cdFx0XHRcdFx0XHR0aHJvd0Vycm9yID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgRW51bUpTRGlmZkNoYW5nZVR5cGUuUkVNT1ZFRDpcblxuXHRcdFx0XHRzd2l0Y2ggKHR5cGVfbmV4dClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhc2UgRW51bUpTRGlmZkNoYW5nZVR5cGUuQ09OVEVYVDpcblx0XHRcdFx0XHRjYXNlIEVudW1KU0RpZmZDaGFuZ2VUeXBlLk5PTkU6XG5cdFx0XHRcdFx0XHRtcy5yZW1vdmUob3B0czIuc291cmNlX2lkeCwgaWR4X25leHQpO1xuXG5cdFx0XHRcdFx0XHR0aHJvd0Vycm9yID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdG9wdHMyLnNvdXJjZV9pZHggPSBpZHhfbmV4dDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgRW51bUpTRGlmZkNoYW5nZVR5cGUuQURERUQ6XG5cblx0XHRcdFx0XHRcdG1zLm92ZXJ3cml0ZShvcHRzMi5zb3VyY2VfaWR4LCBpZHhfbmV4dCwgcm93X25leHQudmFsdWUpO1xuXG5cdFx0XHRcdFx0XHR0aHJvd0Vycm9yID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdG9wdHMyLnNvdXJjZV9pZHggPSBpZHhfbmV4dDtcblxuXHRcdFx0XHRcdFx0aSsrO1xuXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGlmICh0aHJvd0Vycm9yKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBydWxlYClcblx0XHR9XG5cblx0XHRpKys7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG1zLFxuXHRcdHNvdXJjZSxcblx0XHR0YXJnZXQsXG5cdFx0ZGlmZixcblx0XHRvcHRpb25zLFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGtDaGFuZ2VUeXBlKHJvdzogSlNEaWZmQ2hhbmdlKVxue1xuXHRpZiAoIXJvdylcblx0e1xuXHRcdHJldHVybiBFbnVtSlNEaWZmQ2hhbmdlVHlwZS5OT05FXG5cdH1cblx0ZWxzZSBpZiAocm93LmFkZGVkKVxuXHR7XG5cdFx0cmV0dXJuIEVudW1KU0RpZmZDaGFuZ2VUeXBlLkFEREVEXG5cdH1cblx0ZWxzZSBpZiAocm93LnJlbW92ZWQpXG5cdHtcblx0XHRyZXR1cm4gRW51bUpTRGlmZkNoYW5nZVR5cGUuUkVNT1ZFRFxuXHR9XG5cblx0cmV0dXJuIEVudW1KU0RpZmZDaGFuZ2VUeXBlLkNPTlRFWFRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJR2VuZXJhdGVTdHJpbmdTb3VyY2VNYXBPcHRpb25zIGV4dGVuZHMgSURpZmZTdHJpbmdPcHRpb25zXG57XG5cdHNvdXJjZUZpbGU/OiBzdHJpbmcsXG5cdHRhcmdldEZpbGU/OiBzdHJpbmcsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVN0cmluZ1NvdXJjZU1hcDxPIGV4dGVuZHMgSUdlbmVyYXRlU3RyaW5nU291cmNlTWFwT3B0aW9ucz4oc3RyX29sZDogQnVmZmVyIHwgc3RyaW5nLFxuXHRzdHJfbmV3OiBCdWZmZXIgfCBzdHJpbmcsXG5cdG9wdGlvbnM6IE8gPSB7fSBhcyBhbnksXG4pXG57XG5cdGNvbnN0IGRhdGEgPSBkaWZmTWFnaWNTdHJpbmc8Tz4oc3RyX29sZCwgc3RyX25ldywgb3B0aW9ucyk7XG5cblx0bGV0IHsgc291cmNlRmlsZSwgdGFyZ2V0RmlsZSB9ID0gZGF0YS5vcHRpb25zO1xuXG5cdGxldCBzb3VyY2VtYXAgPSBnZW5lcmF0ZU1hZ2ljU3RyaW5nTWFwKGRhdGEubXMsIGRhdGEub3B0aW9ucyk7XG5cblx0cmV0dXJuIHtcblx0XHQuLi5kYXRhLFxuXHRcdHNvdXJjZW1hcCxcblx0XHRzb3VyY2VGaWxlLFxuXHRcdHRhcmdldEZpbGUsXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlTWFnaWNTdHJpbmdNYXA8TyBleHRlbmRzIElHZW5lcmF0ZVN0cmluZ1NvdXJjZU1hcE9wdGlvbnM+KG1zOiBNYWdpY1N0cmluZyxcblx0b3B0aW9uczogTyB8IHN0cmluZyA9IHt9IGFzIGFueSxcbilcbntcblx0bGV0IHNvdXJjZUZpbGU6IHN0cmluZztcblxuXHRpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKVxuXHR7XG5cdFx0c291cmNlRmlsZSA9IG9wdGlvbnM7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0KHsgc291cmNlRmlsZSB9ID0gb3B0aW9ucyk7XG5cdH1cblxuXHRyZXR1cm4gbXMuZ2VuZXJhdGVNYXAoe1xuXHRcdHNvdXJjZTogc291cmNlRmlsZSxcblx0XHRpbmNsdWRlQ29udGVudDogdHJ1ZSxcblx0XHRoaXJlczogdHJ1ZSxcblx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0TGluZXMoY29udGV4dDogc3RyaW5nIHwgQnVmZmVyKVxue1xuXHRpZiAodHlwZW9mIGNvbnRleHQgIT09ICdzdHJpbmcnKVxuXHR7XG5cdFx0Y29udGV4dCA9IGNvbnRleHQudG9TdHJpbmcoKTtcblx0fVxuXG5cdHJldHVybiBjb250ZXh0LnNwbGl0KFwiXFxuXCIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMaW5lQ29sdW1uPFQgZXh0ZW5kcyBQb3NpdGlvbj4obGluZXM6IHN0cmluZ1tdIHwgc3RyaW5nLFxuXHRwb3NpdGlvbjogSVRTVmFsdWVPckFycmF5PElUU1BhcnRpYWxXaXRoPFQsICdjb2x1bW4nPj4sXG4pXG57XG5cdGlmICghQXJyYXkuaXNBcnJheShsaW5lcykpXG5cdHtcblx0XHRsaW5lcyA9IHNwbGl0TGluZXMobGluZXMpO1xuXHR9XG5cblx0aWYgKCFBcnJheS5pc0FycmF5KHBvc2l0aW9uKSlcblx0e1xuXHRcdHBvc2l0aW9uID0gW3Bvc2l0aW9uXTtcblx0fVxuXG5cdHJldHVybiBwb3NpdGlvblxuXHRcdC5yZWR1Y2UoKGEsIG9wdGlvbnMpID0+XG5cdFx0e1xuXHRcdFx0bGV0IHRhcmdldF9saW5lID0gb3B0aW9ucy5saW5lIC0gMTtcblxuXHRcdFx0bGV0IHZhbHVlID0gbGluZXNbdGFyZ2V0X2xpbmVdO1xuXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0bGV0IHZhbHVlX2NvbHVtbjogc3RyaW5nO1xuXG5cdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jb2x1bW4gPT09ICdudW1iZXInKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFsdWVfY29sdW1uID0gdmFsdWUuY2hhckF0KG9wdGlvbnMuY29sdW1uIC0gMSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGEucHVzaCh7XG5cdFx0XHRcdFx0Li4ub3B0aW9ucyxcblx0XHRcdFx0XHR2YWx1ZSxcblx0XHRcdFx0XHR2YWx1ZV9jb2x1bW4sXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhO1xuXHRcdH0sIFtdIGFzIChJVFNQYXJ0aWFsV2l0aDxULCAnY29sdW1uJz4gJiB7XG5cdFx0XHR2YWx1ZTogc3RyaW5nXG5cdFx0fSlbXSlcblx0XHQ7XG59XG5cbiJdfQ==