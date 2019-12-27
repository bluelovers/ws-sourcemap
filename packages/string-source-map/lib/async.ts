import { RawSourceMap, SourceMapConsumer } from 'source-map';
import Bluebird from 'bluebird';
import createSourceMapConsumerSync from './sync';
import { SourceMap } from 'magic-string';
import { ITSBluebirdPromisifyAll } from 'ts-type';

export function createSourceMapConsumerASync(sourcemap: RawSourceMap | SourceMap)
{
	let smc = createSourceMapConsumerSync(sourcemap);

	return wrapSourceMapConsumerASync(smc)
}

export function wrapSourceMapConsumerASync<T extends SourceMapConsumer>(smc: T)
{
	return Bluebird.promisifyAll(smc, {
		suffix: '',
		filter(name) {
			return typeof smc[name] === 'function'
		},
	}) as any as ITSBluebirdPromisifyAll<T>
}

export default createSourceMapConsumerASync
