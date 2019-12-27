import { extractSourceMapFromTarget } from './extract';

export function decodeBase64(value: string)
{
	return Buffer.from(value, 'base64').toString()
}

export function parseJSON<T extends any>(value: string): T
{
	return JSON.parse(value)
}

export function parseBase64<T extends any>(value: string): T
{
	return parseJSON<T>(decodeBase64(value))
}

export function parseComment<T extends any>(valueInput: string)
{
	let s = extractSourceMapFromTarget(valueInput);

	if (!s)
	{
		throw new TypeError(`sourcemap comment not exists`)
	}

	let { type, value } = chkCommentType(s);

	if (type === EnumSourceMapCommentType.BASE64)
	{
		return {
			type,
			value: parseBase64(value) as T,
		};
	}

	return {
		type,
		file: value,
	}
}

export enum EnumSourceMapCommentType
{
	DEFAULT,
	BASE64,
}

export function chkCommentType(value: string)
{
	let type = EnumSourceMapCommentType.DEFAULT;

	if (value.match(/^data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(.*)$/))
	{
		value = RegExp.$1;
		type = EnumSourceMapCommentType.BASE64;
	}

	return {
		type,
		value,
	}
}
