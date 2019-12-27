/**
 * Created by user on 2019/12/28.
 */
import { RE_SOURCE_MAP_COMMENT_02, RE_SOURCE_MAP_COMMENT_01 } from './const';

export function stripSourceMapComment(input: string)
{
	return input
		.replace(RE_SOURCE_MAP_COMMENT_01, '')
		.replace(RE_SOURCE_MAP_COMMENT_02, '')
	;
}
