/**
 * Created by user on 2019/12/27.
 */

import { Diff, BaseOptions } from 'diff';
import _zhRegExp from 'regexp-cjk';
import createZhRegExpCorePlugin from 'regexp-cjk-plugin-escape-unicode-property';
import createZhRegExpPlugin, { IZhRegExpPluginOptions } from 'regexp-cjk-plugin-extra';
import { outputJSONSync } from 'fs-extra';
import path from "path";
import { rootDir } from '../../test/_local-dev';
import UString from 'uni-string'

let zhRegExp = _zhRegExp.use({
	flags: 'u',
	onCore: [
		createZhRegExpCorePlugin({
			/**
			 * just do it
			 */
			//escapeAll: true,
			/**
			 * auto detect do or not
			 * @default true
			 */
			escapeAuto: true,
		}),
	],
	on: [
		createZhRegExpPlugin({
			autoVoice: true,
			autoFullHaif: true,
			autoDeburr: true,
		})
	]
});

let re = new zhRegExp(/(\n|[\xA0\s]|[ァ-ヴーｱ-ﾝﾞｰ]+|["({\[\]})<>‹›«»「」‘’“”'【】《》『』（）]+|[，。！…⋯？～~?!\.—─]+|[\u4E00-\u9FFF\u{20000}-\u{2FA1F}]|[\w\u0100-\u017F\u0400-\u04FF\u00A1-\u00FF\u0180-\u024f０-９ａ-ｚ]+|[\p{Script_Extensions=Hiragana}])/iu);

const re2 = new zhRegExp(/(\n+|["({\[\]})<>‹›«»「」‘’“”'【】《》『』（），。！…⋯？～~?!\.—─,\p{P}\p{Pc}\p{Pd}\p{Pe}\p{Pf}\p{Pi}\p{Po}\p{Ps}])/iu);

re = new zhRegExp(/(\n|.)/iu);

console.dir({
	re,
})

export class DiffNovel extends Diff
{
	tokenize(value: string)
	{
//		let ls = value
//			.split(re)
//			.filter(v => v !== '')
//			.reduce((a, v) => {
//
//				//a.push(...v.split(re2).filter(v => v !== ''));
//				a.push(v);
//
//				return a
//			}, [] as string[])
//		;

		let ls = UString.split(value, '');

		outputJSONSync(path.join(rootDir, 'test/temp', `diff.ls.json`), ls, {
			spaces: 2,
		});

		return ls
	}
}

export const novelDiff = new DiffNovel();

export function diffNovelChars(oldStr: string, newStr: string, options?: BaseOptions)
{
	return novelDiff.diff(oldStr, newStr, options)
}

export default diffNovelChars
