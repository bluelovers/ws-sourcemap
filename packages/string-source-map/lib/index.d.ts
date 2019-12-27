/// <reference types="node" />
import { IGenerateStringSourceMapOptions } from './util';
import MagicString, { SourceMap } from 'magic-string';
import { Change as JSDiffChange, PatchOptions } from 'diff';
import { SourceMapConsumer, SourceFindPosition, Position, MappedPosition, RawSourceMap } from 'source-map';
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
    get original(): string;
    get generated(): string;
    get sourcemap(): SourceMap;
    /**
     * SourceMapConsumer
     *
     * @returns {SourceMapConsumer}
     */
    get smc(): SourceMapConsumer;
    get sourceFile(): string;
    set sourceFile(value: string);
    get targetFile(): string;
    set targetFile(value: string);
    /**
     * 只允許執行一次，執行後會鎖定拒絕更改屬性
     */
    process(options?: IStringSourceMapOptions, ...argv: any[]): this;
    processForce(options?: IStringSourceMapOptions, ...argv: any[]): this;
    destroy(): this;
    fakeThen<R extends any>(cb: (this: this, obj: this) => ITSResolvable<R>): Bluebird<R>;
    /**
     * 從 target 的行列位置來反查在 source 內的原始位置
     */
    originalPositionFor(...argv: Parameters<SourceMapConsumer["originalPositionFor"]>): MappedPosition;
    /**
     * 從 source 內的原始位置來查詢在 target 的行列位置
     */
    generatedPositionFor(originalPosition: ITSPartialWith<SourceFindPosition, 'source'>): import("source-map").LineRange;
    allGeneratedPositionsFor(originalPosition: ITSPartialWith<MappedPosition, 'source'>): Position[];
    toJSON(): RawSourceMap;
    toString(): string;
    toUrl(): string;
    originalLineFor(...argv: Parameters<StringSourceMap["originalPositionFor"]>): (Pick<Position, "line"> & import("ts-type").ITSPartialPick<Position, "column"> & {
        value: string;
    })[];
    protected _splitLines(key: 'source' | 'target'): any;
    originalLines<T extends Position>(position: ITSValueOrArray<ITSPartialWith<T, 'column'>>): (Pick<T, Exclude<keyof T, "column">> & import("ts-type").ITSPartialPick<T, "column"> & {
        value: string;
    })[];
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
export {};
