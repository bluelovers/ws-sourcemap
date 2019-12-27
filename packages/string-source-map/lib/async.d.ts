import { RawSourceMap, SourceMapConsumer } from 'source-map';
import { SourceMap } from 'magic-string';
import { ITSBluebirdPromisifyAll } from 'ts-type';
export declare function createSourceMapConsumerASync(sourcemap: RawSourceMap | SourceMap): ITSBluebirdPromisifyAll<SourceMapConsumer, any>;
export declare function wrapSourceMapConsumerASync<T extends SourceMapConsumer>(smc: T): ITSBluebirdPromisifyAll<T, any>;
export default createSourceMapConsumerASync;
