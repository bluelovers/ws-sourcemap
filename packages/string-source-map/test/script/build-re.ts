
import regexpClassToObject from 'regexp-class-to-regenerate';
import regenerate from 'regenerate';
import _zhRegExp from 'regexp-cjk';
import createZhRegExpCorePlugin from 'regexp-cjk-plugin-escape-unicode-property';

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
});

const Punctuation = new zhRegExp(/\p{Punctuation}/u);

console.dir(Punctuation);

console.dir(new zhRegExp(/(\n|\s|[\u4E00-\u9FFF\u{20000}-\u{2FA1F}]|\p{Punctuation}+|.)/u))


