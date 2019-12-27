/**
 * Created by user on 2019/12/28.
 */

import { IRawSourceMapJSON, ILazySourceMapInput } from './types';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';

export function _toRawSourceMapJSON<T extends any>(properties: ILazySourceMapInput, callback?: (input: T) => ILazySourceMapInput): IRawSourceMapJSON
{
	if (typeof properties === 'string')
	{
		properties = new SourceMapConsumer(JSON.parse(properties));
	}

	if (properties instanceof SourceMapConsumer)
	{
		return SourceMapConsumerToRawSourceMapJSON(properties);
	}
	else if (properties instanceof SourceMapGenerator)
	{
		return SourceMapGeneratorToRawSourceMapJSON(properties);
	}
	else if (typeof properties === 'object')
	{
		return _toRawSourceMapJSON(new SourceMapConsumer(properties as any))
	}
	else if (callback)
	{
		return _toRawSourceMapJSON(callback(properties))
	}

	throw new TypeError(`can't make SourceMap from [${properties}] ${JSON.stringify(properties)}`)
}

export function SourceMapConsumerToRawSourceMapJSON<T extends IRawSourceMapJSON>(properties: SourceMapConsumer): T
{
	return SourceMapGenerator.fromSourceMap(properties).toJSON() as T;
}

export function SourceMapGeneratorToRawSourceMapJSON<T extends IRawSourceMapJSON>(properties: SourceMapGenerator): T
{
	return properties.toJSON() as T;
}
