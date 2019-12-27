/**
 * Created by user on 2019/12/28.
 */
import { SourceMapConsumer, SourceMapGenerator, RawSourceMap } from 'source-map';
import { ITSOverwrite, ITSPickExtra2 } from 'ts-type';
declare module 'source-map' {
    interface SourceMapGenerator {
        toJSON(): IRawSourceMapJSON;
        toJSON<T extends IRawSourceMapJSONRuntime = IRawSourceMapJSON>(): T;
    }
}
export interface IRawSourceMapJSONRuntime extends ITSOverwrite<ITSPickExtra2<IRawSourceMapJSON, 'file' | 'sourceRoot' | 'sourcesContent'>, {
    version: number | string;
}> {
}
export interface IRawSourceMapJSON {
    version: number;
    sources: string[];
    mappings: string;
    names: string[];
    file: string;
    sourceRoot: string;
    sourcesContent: string[];
}
export declare type IRawSourceMap = IRawSourceMapJSON | RawSourceMap | IRawSourceMapJSONRuntime;
export declare type ILazySourceMapInput = IRawSourceMap | SourceMapGenerator | SourceMapConsumer | string;
