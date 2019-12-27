/// <reference types="node" />
import MagicString, { SourceMap } from 'magic-string';
import { CR, CRLF, LF } from 'crlf-normalize';
import { Change as JSDiffChange } from 'diff';
import * as JSDiff from 'diff';
import { Position } from 'source-map';
import { ITSPartialWith, ITSValueOrArray, ITSExtractRecord, ITSKeyOf } from 'ts-type';
export declare enum EnumJSDiffChangeType {
    NONE = 0,
    CONTEXT = 1,
    ADDED = 2,
    REMOVED = 3
}
export declare function handleInputOptions<T extends IDiffStringOptions>(options: T): T;
export declare function handleInputString(str_old: Buffer | string, options?: IDiffStringOptions): string;
export declare type IJSDiffMethod = ITSExtractRecord<typeof JSDiff, IJSDiffFnLike>;
export declare type IJSDiffFnLike = ((oldStr: string, newStr: string, options?: JSDiff.BaseOptions) => JSDiffChange[]);
export declare type IDiffStringFn = ITSKeyOf<IJSDiffMethod> | IJSDiffMethod | IJSDiffFnLike | JSDiff.Diff;
export interface IDiffStringOptions {
    autoCRLF?: typeof CR | typeof CRLF | typeof LF | true;
    /**
     * 允許更換 diff 分析函數，但無法保證正常運作
     * 預設為
     */
    diffFunc?: IDiffStringFn;
    diffOpts?: JSDiff.BaseOptions & object;
}
export interface IDiffStringReturn<O extends IDiffStringOptions> {
    source: string;
    target: string;
    diff: JSDiffChange[];
    options: O;
}
export declare function diffString<O extends IDiffStringOptions>(str_old: Buffer | string, str_new: Buffer | string, options?: O): IDiffStringReturn<O>;
export declare function diffMagicString<O extends IDiffStringOptions>(str_old: Buffer | string, str_new: Buffer | string, opts?: O): {
    ms: MagicString;
    source: string;
    target: string;
    diff: JSDiffChange[];
    options: O;
};
export declare function diffMagicStringCore<O extends IDiffStringOptions>(opts1: IDiffStringReturn<O>, opts2: {
    ms: MagicString;
    source_idx: number;
    deep: number;
}): {
    ms: MagicString;
    source: string;
    target: string;
    diff: JSDiffChange[];
    options: O;
};
export declare function chkChangeType(row: JSDiffChange): EnumJSDiffChangeType;
export interface IGenerateStringSourceMapOptions extends IDiffStringOptions {
    sourceFile?: string;
    targetFile?: string;
}
export declare function generateStringSourceMap<O extends IGenerateStringSourceMapOptions>(str_old: Buffer | string, str_new: Buffer | string, options?: O): {
    sourcemap: SourceMap;
    sourceFile: string;
    targetFile: string;
    ms: MagicString;
    source: string;
    target: string;
    diff: JSDiffChange[];
    options: O;
};
export declare function generateMagicStringMap<O extends IGenerateStringSourceMapOptions>(ms: MagicString, options?: O | string): SourceMap;
export declare function splitLines(context: string | Buffer): string[];
export declare function getLineColumn<T extends Position>(lines: string[] | string, position: ITSValueOrArray<ITSPartialWith<T, 'column'>>): (Pick<T, Exclude<keyof T, "column">> & import("ts-type").ITSPartialPick<T, "column"> & {
    value: string;
})[];
