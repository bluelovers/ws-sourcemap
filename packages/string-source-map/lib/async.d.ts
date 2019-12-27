import { RawSourceMap, SourceMapConsumer } from 'source-map';
import Bluebird from 'bluebird';
import { SourceMap } from 'magic-string';
declare type FlagExcludedType<Base, Type> = {
    [Key in keyof Base]: Base[Key] extends Type ? never : Key;
};
declare type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];
declare type OmitType<Base, Type> = Pick<Base, AllowedNames<Base, Type>>;
declare type PickType<Base, Type> = Omit<Base, AllowedNames<Base, Type>>;
declare type IPromisifyAll<T, K extends keyof PickType<T, Function> = keyof PickType<T, Function>> = OmitType<T, Function> & {
    [P in K]: (...argv: Parameters<T[P]>) => Bluebird<ReturnType<T[P]>>;
};
export declare function createSourceMapConsumerASync(sourcemap: RawSourceMap | SourceMap): IPromisifyAll<SourceMapConsumer, "computeColumnSpans" | "originalPositionFor" | "generatedPositionFor" | "allGeneratedPositionsFor" | "hasContentsOfAllSources" | "sourceContentFor" | "eachMapping">;
export declare function wrapSourceMapConsumerASync<T extends SourceMapConsumer>(smc: T): IPromisifyAll<T, Exclude<keyof T, FlagExcludedType<T, Function>[keyof T]>>;
export default createSourceMapConsumerASync;
