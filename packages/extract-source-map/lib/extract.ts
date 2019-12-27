/**
 * @deprecated
 */
enum EnumExtractSourceMapType
{
	JS = 0x0001,
	CSS = 0x0002,
}

export function extractSourceMapFromTargetAllCore(value: string)
{
	let lastMatchs: RegExpExecArray[] = [];

	[
		/(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)/mg,
		/(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg,
	].some(re =>
	{

		if (re)
		{
			let match: RegExpExecArray;

			re.lastIndex = 0;

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
