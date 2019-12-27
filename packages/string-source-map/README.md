# README.md

    create sourcemap form give two string

## install

```
yarn add string-source-map
```

## demo

```ts
// @ts-ignore
import { chai, relative, expect, path, assert, util, mochaAsync, SymbolLogOutput, rootDir } from './_local-dev';
import { StringSourceMap } from 'string-source-map';
import { readFileSync } from 'fs-extra';
import diffNovelChars from 'string-source-map/lib/diff/novel';

let ssm = new StringSourceMap({
	/**
	 * 可以自行替換要使用的比對函數
	 */
	diffFunc: diffNovelChars,
});

let id = '002';
let dir = path.join(rootDir, 'test', 'res', id);

let file_src = path.join(dir, `source.txt`);
let file_target = path.join(dir, `target.txt`);

/*
// source 與 target 可以用這種方式來設定 或者 傳遞於 process() 內

ssm.source = readFileSync(path.join(dir, `source.txt`));
ssm.target = readFileSync(path.join(dir, `target.txt`));
*/

ssm.process({

	source: readFileSync(file_src),

	target: readFileSync(file_target),

});

let genPos = {
	line: 10,
	column: 5,
};

let origPos = ssm.originalPositionFor(genPos);
let genPos2 = ssm.generatedPositionFor(origPos);

/*
大多數情況下等於 generatedPositionFor
 */
let genPosAll = ssm.allGeneratedPositionsFor(origPos);

console.dir({
	genPos,
	genPos2,
	origPos,
	genPosAll,
});
/*
{
  genPos: { line: 10, column: 5 },
  genPos2: { line: 10, column: 5, lastColumn: null },
  origPos: {
    source: '2019-12-27T01:45:41.142Z',
    line: 9,
    column: 10,
    name: null
  },
  genPosAll: [ { line: 10, column: 5, lastColumn: null } ]
}
 */

console.dir(ssm.originalLines(origPos));
/*
[
  {
    source: '2019-12-27T01:39:17.780Z',
    line: 9,
    column: 10,
    name: null,
    value: '與雷伊斯（レイス）還有他的不死龍僕從激鬥後過了幾天，艾麗婭一行人返回迷宮都市。',
    value_column: '還'
  }
]
 */

console.dir(ssm.originalLineFor(genPos));
/*
[
  {
    source: '2019-12-27T01:39:17.780Z',
    line: 9,
    column: 10,
    name: null,
    value: '與雷伊斯（レイス）還有他的不死龍僕從激鬥後過了幾天，艾麗婭一行人返回迷宮都市。',
    value_column: '還'
  }
]
 */

console.dir(ssm.originalLineFor(genPosAll));
/*
[
  {
    source: '2019-12-27T01:43:52.419Z',
    line: 9,
    column: 10,
    name: null,
    value: '與雷伊斯（レイス）還有他的不死龍僕從激鬥後過了幾天，艾麗婭一行人返回迷宮都市。',
    value_column: '還'
  }
]
 */

```
