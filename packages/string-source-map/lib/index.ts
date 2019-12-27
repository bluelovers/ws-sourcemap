import {
	IGenerateStringSourceMapOptions,
	handleInputOptions,
	handleInputString,
	generateStringSourceMap, diffMagicString, generateMagicStringMap, getLineColumn, splitLines,
} from './util';
import MagicString, { SourceMap } from 'magic-string';
import { Change as JSDiffChange, createPatch, createTwoFilesPatch, PatchOptions } from 'diff';
import {
	SourceMapConsumer,
	SourceFindPosition,
	FindPosition,
	Position,
	MappedPosition,
	RawSourceMap,
} from 'source-map';
import createSourceMapConsumerSync from './sync';
import { ITSResolvable, ITSPartialWith, ITSPropertyKey, ITSValueOrArray } from 'ts-type';
import Bluebird from 'bluebird';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

const SymHidden = Symbol('prop');

export interface IStringSourceMapOptions extends IGenerateStringSourceMapOptions
{
	source?: string | Buffer,
	target?: string | Buffer,
}

export class StringSourceMap
{
	protected [SymHidden]: {
		source: string,
		target: string,
		locked: boolean,
		options: IStringSourceMapOptions,
		ms: MagicString,
		diff: JSDiffChange[],
		sourcemap: SourceMap,
		smc: SourceMapConsumer,

		_tmp_source: string[],
		_tmp_target: string[],
	} = {} as any;

	constructor(options?: IStringSourceMapOptions, ...argv)
	{
		this._constructor(options, ...argv)
	}

	protected _reset()
	{
		Object.keys(this[SymHidden])
			.forEach(key => {
				if (key.startsWith('_tmp_'))
				{
					this[SymHidden][key] = null;
				}
			})
		;
	}

	@CheckLockedMethod
	protected _constructor(options: IStringSourceMapOptions, ...argv)
	{
		options = handleInputOptions({
			...options,
		});

		let { source, target } = options;

		delete options.source;
		delete options.target;

		this[SymHidden].options = merge(this[SymHidden].options, options);

		if (source != null)
		{
			this.source = source;
		}

		if (target != null)
		{
			this.target = target;
		}

		this._reset();

		let _temp = this.sourceFile;

		return this
	}

	get source()
	{
		return this[SymHidden].source
	}

	@CheckLockedProperty
	set source(value: string | Buffer)
	{
		this[SymHidden].source = handleInputString(value, this[SymHidden].options);
	}

	get locked()
	{
		return this[SymHidden] && this[SymHidden].locked
	}

	get target()
	{
		return this[SymHidden].target
	}

	@CheckLockedProperty
	set target(value: string | Buffer)
	{
		this[SymHidden].target = handleInputString(value, this[SymHidden].options);
	}

	get sourcemap()
	{
		if (this[SymHidden].sourcemap == null && this.locked)
		{
			this[SymHidden].sourcemap = generateMagicStringMap(this[SymHidden].ms, this[SymHidden].options)
		}

		return this[SymHidden].sourcemap
	}

	/**
	 * SourceMapConsumer
	 *
	 * @returns {SourceMapConsumer}
	 */
	get smc(): SourceMapConsumer
	{
		if (this[SymHidden].smc == null && this.locked)
		{
			this[SymHidden].smc = createSourceMapConsumerSync(this.sourcemap)
		}

		return this[SymHidden].smc
	}

	/**
	 * 來源檔案名稱
	 */
	get sourceFile()
	{
		if (this[SymHidden].options.sourceFile == null)
		{
			this[SymHidden].options.sourceFile = new Date().toISOString();
		}

		return this[SymHidden].options.sourceFile
	}

	@CheckLockedProperty
	set sourceFile(value: string)
	{
		this[SymHidden].options.sourceFile = value.toString()
	}

	/**
	 * 目標檔案名稱
	 */
	get targetFile()
	{
		if (this[SymHidden].options.targetFile == null)
		{
			return this.sourceFile
		}

		return this[SymHidden].options.targetFile
	}

	@CheckLockedProperty
	set targetFile(value: string)
	{
		this[SymHidden].options.targetFile = value.toString()
	}

	/**
	 * 只允許執行一次，執行後會鎖定拒絕更改屬性
	 */
	@CheckLockedMethod
	process(options?: IStringSourceMapOptions, ...argv)
	{
		this._constructor(options, ...argv);

		if (this.source == null || this.target == null)
		{
			throw new TypeError(`source or target is undefined`)
		}

		this[SymHidden].locked = true;

		let { ms, diff } = diffMagicString(this.source, this.target, this[SymHidden].options);

		this[SymHidden].ms = ms;
		this[SymHidden].diff = diff;

		return this
	}

	processForce(options?: IStringSourceMapOptions, ...argv)
	{
		this[SymHidden].locked = false;
		return this.process(options, ...argv);
	}

	/**
	 * 試圖主動釋放記憶體
	 */
	destroy()
	{
		this._reset();

		// @ts-ignore
		if (this.smc && this.smc.destroy)
		{
			// @ts-ignore
			this.smc.destroy();
		}

		Object.keys(this[SymHidden])
			.forEach(k => delete this[SymHidden][k])
		;

		this[SymHidden].locked = true;

		return this;
	}

	fakeThen<R extends any>(cb: (this: this, obj: this) => ITSResolvable<R>)
	{
		return Bluebird
			.resolve(this)
			.bind(this)
			.then(cb)
			;
	}

	/**
	 * 從 target 的行列位置來反查在 source 內的原始位置
	 */
	originalPositionFor(generatedPosition: FindPosition)
	{
		return this.smc.originalPositionFor(generatedPosition)
	}

	/**
	 * 從 source 內的原始位置來查詢在 target 的行列位置
	 */
	generatedPositionFor(originalPosition: ITSPartialWith<SourceFindPosition, 'source'>)
	{
		if (originalPosition.source == null)
		{
			originalPosition.source = this.sourceFile;
		}

		return this.smc.generatedPositionFor(originalPosition as SourceFindPosition)
	}

	allGeneratedPositionsFor(originalPosition: ITSPartialWith<MappedPosition, 'source'>)
	{
		if (originalPosition.source == null)
		{
			originalPosition.source = this.sourceFile;
		}

		return this.smc.allGeneratedPositionsFor(originalPosition as MappedPosition)
	}

	toJSON(): RawSourceMap
	{
		let {
			version,
			file,
			sources,
			sourcesContent,
			mappings,
			names,
		} = this.sourcemap;

		return cloneDeep({
			version: version.toString(),
			file,
			sources,
			sourcesContent,
			mappings,
			names,
		})
	}

	toString()
	{
		return this.sourcemap.toString()
	}

	/**
	 * sourcemap 的 base64 url
	 * @returns {string}
	 */
	toUrl(includeComment?: boolean)
	{
		let url = this.sourcemap.toUrl();

		if (includeComment)
		{
			url = '//# sourceMappingURL=' + url;
		}

		return url
	}

	/**
	 * 以新內容的位置資訊來查詢原始位置與文字內容
	 */
	originalLineFor(generatedPosition: ITSValueOrArray<FindPosition>)
	{
		if (!Array.isArray(generatedPosition))
		{
			generatedPosition = [generatedPosition]
		}

		let pos = generatedPosition.map(pos => this.originalPositionFor(pos));

		return this.originalLines(pos);
	}

	/**
	 * 以原始內容的位置資訊來查詢新位置與文字內容
	 */
	generatedLineFor(...argv: Parameters<StringSourceMap["generatedPositionFor"]>)
	{
		let pos = this.generatedPositionFor(...argv);

		return this.generatedLines(pos);
	}

	protected _splitLines(key: 'source' | 'target')
	{
		let key_cache = `_tmp_${key}`;

		if (!this[SymHidden][key_cache])
		{
			this[SymHidden][key_cache] = splitLines(this[key])
		}

		return this[SymHidden][key_cache]
	}

	/**
	 * 取得原始字串中的 行列 所在文字內容
	 */
	originalLines<T extends Position>(position: ITSValueOrArray<ITSPartialWith<T, 'column'>>)
	{
		return getLineColumn(this._splitLines('source'), position)
	}

	/**
	 * 取得新字串中的 行列 所在文字內容
	 */
	generatedLines<T extends Position>(position: ITSValueOrArray<ITSPartialWith<T, 'column'>>)
	{
		return getLineColumn(this._splitLines('target'), position)
	}

	createPatch(options: IPatchOptions = {})
	{
		return createTwoFilesPatch(this.sourceFile, this.targetFile, this.source as string, this.target as string, options.oldHeader, options.newHeader, options.patchOptions)
	}

}

export interface IPatchOptions
{
	oldHeader?: string,
	newHeader?: string,
	patchOptions?: PatchOptions,
}

function CheckLockedProperty<T extends any>(target: any, prop: ITSPropertyKey, descriptor: TypedPropertyDescriptor<T>)
{
	const old = descriptor.set;
	// @ts-ignore
	descriptor.set = function (this: StringSourceMap, ...argv)
	{
		if (this.locked)
		{
			throw new ReferenceError(`locked`)
		}

		return old.apply(this, argv);
	};
}

function CheckLockedMethod<T extends any>(target: any, prop: ITSPropertyKey, descriptor: TypedPropertyDescriptor<T>)
{
	const old = descriptor.value;
	// @ts-ignore
	descriptor.value = function (this: StringSourceMap, ...argv)
	{
		if (this.locked)
		{
			throw new ReferenceError(`locked`)
		}

		return old.apply(this, argv);
	};

	return descriptor
}

export default StringSourceMap
