import { diffChars, diffWords, diffWordsWithSpace } from 'diff';
import MagicString, { SourceMap } from 'magic-string';
import crlf, { CR, CRLF, LF } from 'crlf-normalize';
import { Change as JSDiffChange } from 'diff';
import * as JSDiff from 'diff';
import { Position } from 'source-map';
import {
	ITSPartialWith,
	ITSValueOrArray,
	ITSExtractRecord,
	ITSValueOf,
	ITSKeyOf,
	ITSExtractKeyofRecord,
} from 'ts-type';
import { outputFileSync, outputJSONSync } from 'fs-extra';
import path from 'path';
import { rootDir } from '../test/_local-dev';
import diffNovelChars from './diff/novel';

export enum EnumJSDiffChangeType
{
	NONE,
	CONTEXT,
	ADDED,
	REMOVED,
}

export function handleInputOptions<T extends IDiffStringOptions>(options: T): T
{
	let { autoCRLF } = options;

	if (autoCRLF)
	{
		if (autoCRLF === true)
		{
			autoCRLF = LF;
		}

		options.autoCRLF = autoCRLF;
	}
	else
	{
		delete options.autoCRLF
	}

	return options
}

export function handleInputString(str_old: Buffer | string, options: IDiffStringOptions = {})
{
	str_old = str_old.toString();

	let { autoCRLF } = options;

	if (autoCRLF)
	{
		str_old = crlf(str_old, autoCRLF as any);
	}

	return str_old
}

export type IJSDiffMethod = ITSExtractRecord<typeof JSDiff, IJSDiffFnLike>;

export type IJSDiffFnLike = ((oldStr: string, newStr: string, options?: JSDiff.BaseOptions) => JSDiffChange[]);

export type IDiffStringFn = ITSKeyOf<IJSDiffMethod> | IJSDiffMethod | IJSDiffFnLike | JSDiff.Diff

export interface IDiffStringOptions
{
	autoCRLF?: typeof CR | typeof CRLF | typeof LF | true;

	/**
	 * 允許更換 diff 分析函數，但無法保證正常運作
	 * 預設為
	 */
	diffFunc?: IDiffStringFn,
	diffOpts?: JSDiff.BaseOptions & object,
}

export interface IDiffStringReturn<O extends IDiffStringOptions>
{
	source: string;
	target: string;
	diff: JSDiffChange[];
	options: O;
}

export function diffString<O extends IDiffStringOptions>(str_old: Buffer | string,
	str_new: Buffer | string,
	options: O = {} as any,
): IDiffStringReturn<O>
{
	options = handleInputOptions<O>(options);

	str_old = handleInputString(str_old, options);
	str_new = handleInputString(str_new, options);

	let { diffFunc = diffNovelChars, diffOpts } = options;

	if (diffFunc instanceof JSDiff.Diff)
	{
		diffFunc = diffFunc.diff.bind(diffFunc);
	}
	else if (typeof diffFunc !== 'function')
	{
		if (typeof JSDiff[diffFunc as ITSKeyOf<IJSDiffMethod>] === 'function')
		{
			diffFunc = JSDiff[diffFunc as ITSKeyOf<IJSDiffMethod>] as IJSDiffFnLike
		}
		else
		{
			throw new ReferenceError(`JSDiff.${diffFunc}`)
		}
	}

	return {
		source: str_old,
		target: str_new,
		diff: diffFunc(str_old, str_new, diffOpts),
		options,
	}
}

export function diffMagicString<O extends IDiffStringOptions>(str_old: Buffer | string,
	str_new: Buffer | string,
	opts: O = {} as any,
)
{
	const { source, target, diff, options } = diffString<O>(str_old, str_new, opts);

	let ms = new MagicString(source);

	return diffMagicStringCore<O>({
		source,
		target,
		diff,
		options,
	}, {
		ms,
		source_idx: 0,
		deep: 0,
	})
}

export function diffMagicStringCore<O extends IDiffStringOptions>(opts1: IDiffStringReturn<O>, opts2: {
	ms: MagicString,
	source_idx: number,
	deep: number,
})
{
	const { source, target, diff, options } = opts1;
	let { ms } = opts2;

	let i = 0;
	let row: JSDiffChange;

	outputJSONSync(path.join(rootDir, 'test/temp', 'diff.json'), diff, {
		spaces: 2,
	});

	while (row = diff[i])
	{
		let i_now = i;
		let i_next = i + 1;
		let i_next2 = i + 2;

		let row_next = diff[i_next];
		let type_next = chkChangeType(row_next);

		let idx_next = source.indexOf(row.value, opts2.source_idx) + row.value.length;

		let throwError = true;

		if (1)
		{
			console.dir({
				i_now,
				row,
				row_next,
				row_next2: diff[i_next + 1],
				source_idx: opts2.source_idx,
			});
		}

		switch (chkChangeType(row))
		{
			case EnumJSDiffChangeType.CONTEXT:

				throwError = false;

				opts2.source_idx = idx_next;
				break;
			case EnumJSDiffChangeType.ADDED:

				switch (type_next)
				{
					case EnumJSDiffChangeType.CONTEXT:

						ms.appendRight(opts2.source_idx, row.value);

						throwError = false;

						break;
				}

				break;

			case EnumJSDiffChangeType.REMOVED:

				switch (type_next)
				{
					case EnumJSDiffChangeType.CONTEXT:
					case EnumJSDiffChangeType.NONE:
						ms.remove(opts2.source_idx, idx_next);

						throwError = false;

						opts2.source_idx = idx_next;
						break;
					case EnumJSDiffChangeType.ADDED:

						ms.overwrite(opts2.source_idx, idx_next, row_next.value);

						throwError = false;

						opts2.source_idx = idx_next;

						i++;

						break;
				}

				break;
		}

		if (throwError)
		{
			throw new Error(`unknown rule`)
		}

		i++;
	}

	return {
		ms,
		source,
		target,
		diff,
		options,
	}
}

export function chkChangeType(row: JSDiffChange)
{
	if (!row)
	{
		return EnumJSDiffChangeType.NONE
	}
	else if (row.added)
	{
		return EnumJSDiffChangeType.ADDED
	}
	else if (row.removed)
	{
		return EnumJSDiffChangeType.REMOVED
	}

	return EnumJSDiffChangeType.CONTEXT
}

export interface IGenerateStringSourceMapOptions extends IDiffStringOptions
{
	sourceFile?: string,
	targetFile?: string,
}

export function generateStringSourceMap<O extends IGenerateStringSourceMapOptions>(str_old: Buffer | string,
	str_new: Buffer | string,
	options: O = {} as any,
)
{
	const data = diffMagicString<O>(str_old, str_new, options);

	let { sourceFile, targetFile } = data.options;

	let sourcemap = generateMagicStringMap(data.ms, data.options);

	return {
		...data,
		sourcemap,
		sourceFile,
		targetFile,
	}
}

export function generateMagicStringMap<O extends IGenerateStringSourceMapOptions>(ms: MagicString,
	options: O | string = {} as any,
)
{
	let sourceFile: string;

	if (typeof options === 'string')
	{
		sourceFile = options;
	}
	else
	{
		({ sourceFile } = options);
	}

	return ms.generateMap({
		source: sourceFile,
		includeContent: true,
		hires: true,
	})
}

export function splitLines(context: string | Buffer)
{
	if (typeof context !== 'string')
	{
		context = context.toString();
	}

	return context.split("\n")
}

export function getLineColumn<T extends Position>(lines: string[] | string,
	position: ITSValueOrArray<ITSPartialWith<T, 'column'>>,
)
{
	if (!Array.isArray(lines))
	{
		lines = splitLines(lines);
	}

	if (!Array.isArray(position))
	{
		position = [position];
	}

	return position
		.reduce((a, options) =>
		{
			let target_line = options.line - 1;

			let value = lines[target_line];

			if (typeof value === 'string')
			{
				let value_column: string;

				if (typeof options.column === 'number')
				{
					value_column = value.charAt(options.column - 1)
				}

				a.push({
					...options,
					value,
					value_column,
				})
			}

			return a;
		}, [] as (ITSPartialWith<T, 'column'> & {
			value: string
		})[])
		;
}
