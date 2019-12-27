import { RawSourceMap, SourceMapConsumer } from 'source-map';
import { SourceMap } from 'magic-string';
import { ITSBluebirdPromisifyAll } from 'ts-type';
export declare function createSourceMapConsumerASync(sourcemap: RawSourceMap | SourceMap): ITSBluebirdPromisifyAll<SourceMapConsumer, "computeColumnSpans" | "originalPositionFor" | "generatedPositionFor" | "allGeneratedPositionsFor" | "hasContentsOfAllSources" | "sourceContentFor" | "eachMapping">;
export declare function wrapSourceMapConsumerASync<T extends SourceMapConsumer>(smc: T): ITSBluebirdPromisifyAll<T, import("ts-type").ITSRecordExtractToKey<T, Function>[keyof T]>;
export default createSourceMapConsumerASync;
