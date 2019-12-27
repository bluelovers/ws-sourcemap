/**
 * Created by user on 2019/12/27.
 */

import { Diff, BaseOptions } from 'diff';
import UString from 'uni-string'

export class DiffNovel extends Diff
{
	tokenize(value: string)
	{
		return UString.split(value, '')
	}
}

const novelDiff = new DiffNovel();

export function diffNovelChars(oldStr: string, newStr: string, options?: BaseOptions)
{
	return novelDiff.diff(oldStr, newStr, options)
}

export default diffNovelChars
