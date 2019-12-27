/**
 * @deprecated
 */
import { RE_SOURCE_MAP_COMMENT_01, RE_SOURCE_MAP_COMMENT_02 } from './const';

enum EnumExtractSourceMapType
{
	JS = 0x0001,
	CSS = 0x0002,
}

export function extractSourceMapFromTargetAllCore(value: string)
{
	let lastMatchs: RegExpExecArray[] = [];

	[
		new RegExp(RE_SOURCE_MAP_COMMENT_01.source, RE_SOURCE_MAP_COMMENT_01.flags),
		new RegExp(RE_SOURCE_MAP_COMMENT_02.source, RE_SOURCE_MAP_COMMENT_02.flags),
	].some(re =>
	{
		if (re)
		{
			let match: RegExpExecArray;

			while (match = re.exec(value as string))
			{
				lastMatchs.push(match)
			}

			return lastMatchs.length
		}
	});

	return lastMatchs;
}

export function extractSourceMapFromTargetAll(value: string)
{
	return extractSourceMapFromTargetAllCore(value).map(m => m[1]);
}

export function extractSourceMapFromTarget(value: string)
{
	return extractSourceMapFromTargetAll(value).pop();
}
