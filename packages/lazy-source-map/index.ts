import { IRawSourceMapJSON, IRawSourceMapJSONRuntime, ILazySourceMapInput } from './types';
import { parseComment, EnumSourceMapCommentType } from 'extract-source-map';
import { _toRawSourceMapJSON } from './util';

export { ILazySourceMapInput, IRawSourceMapJSON, IRawSourceMapJSONRuntime }

export class LazySourceMap implements IRawSourceMapJSON
{
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
	static fromContext<T extends IRawSourceMapJSONRuntime>(input: string, callback?: (data: string) => T)
	{
		let data = parseComment<T>(input);
		let { value } = data;

		if (data.type !== EnumSourceMapCommentType.BASE64)
		{
			value = callback(data.file)
		}

		return new this(value)
	}

	static fromBase64(value: string)
	{
		return new this(Buffer.from(value, 'base64').toString())
	}

	static from(value: ILazySourceMapInput)
	{
		return new this(value)
	}

	constructor(properties: ILazySourceMapInput, callback?: <T>(input: T) => ILazySourceMapInput)
	{
		let { version, sources = [], sourcesContent = [], names = [], mappings, file, sourceRoot } = _toRawSourceMapJSON(properties, callback);

		this.version = version | 0;
		this.sources = sources;
		this.mappings = mappings;
		this.names = names;
		this.file = file;
		this.sourceRoot = sourceRoot;
		this.sourcesContent = sourcesContent;
	}

	toJSON(): IRawSourceMapJSON
	{
		let { version, sources, sourcesContent, names, mappings, file, sourceRoot } = this;

		return {
			version,
			sources,
			names,
			mappings,
			file,
			sourceRoot,
			sourcesContent,
		}
	}

	toString(): string
	{
		return JSON.stringify(this.toJSON());
	}

	toBase64()
	{
		return Buffer.from(this.toString()).toString('base64')
	}

	toUrl()
	{
		return `data:application/json;base64,${this.toBase64()}`
	}

	toComment({
		multiline,
		flag,
	}: {
		multiline?: boolean,
		flag?: boolean,
	} = {})
	{
		let prefix = flag ? '@' : '#';
		let value = `${prefix} sourceMappingURL=${this.toUrl()}`;

		if (multiline)
		{
			return `/*${value} */`
		}

		return `//${value}`
	}

}
