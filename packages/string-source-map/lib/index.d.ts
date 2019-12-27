/// <reference types="node" />
import { IGenerateStringSourceMapOptions } from './util';
import MagicString, { SourceMap } from 'magic-string';
import { Change as JSDiffChange, PatchOptions } from 'diff';
import { SourceMapConsumer, SourceFindPosition, FindPosition, Position, MappedPosition, RawSourceMap } from 'source-map';
import { ITSResolvable, ITSPartialWith, ITSValueOrArray } from 'ts-type';
import Bluebird from 'bluebird';
declare const SymHidden: unique symbol;
export interface IStringSourceMapOptions extends IGenerateStringSourceMapOptions {
    source?: string | Buffer;
    target?: string | Buffer;
}
export declare class StringSourceMap {
    protected [SymHidden]: {
        source: string;
        target: string;
        locked: boolean;
        options: IStringSourceMapOptions;
        ms: MagicString;
        diff: JSDiffChange[];
        sourcemap: SourceMap;
        smc: SourceMapConsumer;
        _tmp_source: string[];
        _tmp_target: string[];
    };
    constructor(options?: IStringSourceMapOptions, ...argv: any[]);
    protected _reset(): void;
    protected _constructor(options: IStringSourceMapOptions, ...argv: any[]): this;
    get source(): string | Buffer;
    set source(value: string | Buffer);
    get locked(): boolean;
    get target(): string | Buffer;
    set target(value: string | Buffer);
    get sourcemap(): SourceMap;
    /**
     * SourceMapConsumer
     *
     * @returns {SourceMapConsumer}
     */
    get smc(): SourceMapConsumer;
    /**
     * 來源檔案名稱
     */
    get sourceFile(): string;
    set sourceFile(value: string);
    /**
     * 目標檔案名稱
     */
    get targetFile(): string;
    set targetFile(value: string);
    /**
     * 只允許執行一次，執行後會鎖定拒絕更改屬性
     */
    process(options?: IStringSourceMapOptions, ...argv: any[]): this;
    processForce(options?: IStringSourceMapOptions, ...argv: any[]): this;
    /**
     * 試圖主動釋放記憶體
     */
    destroy(): this;
    fakeThen<R extends any>(cb: (this: this, obj: this) => ITSResolvable<R>): Bluebird<R>;
    /**
     * 從 target 的行列位置來反查在 source 內的原始位置
     */
    originalPositionFor(generatedPosition: FindPosition): MappedPosition;
    /**
     * 從 source 內的原始位置來查詢在 target 的行列位置
     */
    generatedPositionFor(originalPosition: ITSPartialWith<SourceFindPosition, 'source'>): import("source-map").LineRange;
    allGeneratedPositionsFor(originalPosition: ITSPartialWith<MappedPosition, 'source'>): Position[];
    toJSON(): RawSourceMap;
    toString(): string;
    /**
     * sourcemap 的 base64 url
     * @returns {string}
     */
    toUrl(includeComment?: boolean): string;
    /**
     * 以新內容的位置資訊來查詢原始位置與文字內容
     */
    originalLineFor(generatedPosition: ITSValueOrArray<FindPosition>): (Pick<Position, "line"> & import("ts-type").ITSPartialPick<Position, "column"> & {
        value: string;
    })[];
    /**
     * 以原始內容的位置資訊來查詢新位置與文字內容
     */
    generatedLineFor(...argv: Parameters<StringSourceMap["generatedPositionFor"]>): (Pick<Position, "line"> & import("ts-type").ITSPartialPick<Position, "column"> & {
        value: string;
    })[];
    protected _splitLines(key: 'source' | 'target'): any;
    /**
     * 取得原始字串中的 行列 所在文字內容
     */
    originalLines<T extends Position>(position: ITSValueOrArray<ITSPartialWith<T, 'column'>>): (Pick<T, Exclude<keyof T, "column">> & import("ts-type").ITSPartialPick<T, "column"> & {
        value: string;
    })[];
    /**
     * 取得新字串中的 行列 所在文字內容
     */
    generatedLines<T extends Position>(position: ITSValueOrArray<ITSPartialWith<T, 'column'>>): (Pick<T, Exclude<keyof T, "column">> & import("ts-type").ITSPartialPick<T, "column"> & {
        value: string;
    })[];
    createPatch(options?: IPatchOptions): string;
}
export interface IPatchOptions {
    oldHeader?: string;
    newHeader?: string;
    patchOptions?: PatchOptions;
}
export default StringSourceMap;
