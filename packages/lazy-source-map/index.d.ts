import { IRawSourceMapJSON, IRawSourceMapJSONRuntime, ILazySourceMapInput } from './types';
export { ILazySourceMapInput, IRawSourceMapJSON, IRawSourceMapJSONRuntime };
export declare class LazySourceMap implements IRawSourceMapJSON {
    readonly version: number;
    readonly sources: string[];
    readonly mappings: string;
    readonly names: string[];
    readonly file: string;
    readonly sourceRoot: string;
    readonly sourcesContent: string[];
    /**
     * when sourceMappingURL is file path, need use callback for handle it
     */
    static fromContext<T extends IRawSourceMapJSONRuntime>(input: string, callback?: (data: string) => T): LazySourceMap;
    static fromBase64(value: string): LazySourceMap;
    static from(value: ILazySourceMapInput): LazySourceMap;
    constructor(properties: ILazySourceMapInput, callback?: <T>(input: T) => ILazySourceMapInput);
    toJSON(): IRawSourceMapJSON;
    toString(): string;
    toBase64(): string;
    toUrl(): string;
    toComment({ multiline, flag, }?: {
        multiline?: boolean;
        flag?: boolean;
    }): string;
}
