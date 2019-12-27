/**
 * Created by user on 2019/12/28.
 */

export const RE_SOURCE_MAP_COMMENT_01 = /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)/mg;

export const RE_SOURCE_MAP_COMMENT_02 = /(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
