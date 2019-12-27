import { createPatch, diffLines, structuredPatch, diffChars, diffWords } from 'diff';
import * as JSDiff from 'diff';
import MagicString, { SourceMap } from 'magic-string';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { IDiffStringOptions, diffMagicString, diffString } from './util';

export function createSourceMapConsumerSync(sourcemap: RawSourceMap | SourceMap)
{
	return new SourceMapConsumer(sourcemap as any)
}

export default createSourceMapConsumerSync
