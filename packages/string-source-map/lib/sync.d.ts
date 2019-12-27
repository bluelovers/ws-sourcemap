import { SourceMap } from 'magic-string';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
export declare function createSourceMapConsumerSync(sourcemap: RawSourceMap | SourceMap): SourceMapConsumer;
export default createSourceMapConsumerSync;
