// @ts-ignore
import { chai, relative, expect, path, assert, util, mochaAsync, SymbolLogOutput, rootDir } from './_local-dev';
import { StringSourceMap } from '../lib/index';
import { readFileSync } from 'fs-extra';
import diffNovelChars from '../lib/diff/novel';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';
import { existsSync, writeFileSync } from 'fs-extra';
import { parseComment } from 'get-source-map-comment';
import { SourceMap } from 'magic-string';
import { LazySourceMap } from 'lazy-source-map';

let ssm = new StringSourceMap({
	/**
	 * 可以自行替換要使用的比對函數
	 */
	diffFunc: diffNovelChars,
});

let id = '002';
let dir = path.join(rootDir, 'test', 'res', id);

let sourceFile = path.join(dir, `source.txt`);
let targetFile = path.join(dir, `target.txt`);

/*
// source 與 target 可以用這種方式來設定 或者 傳遞於 process() 內

ssm.source = readFileSync(path.join(dir, `source.txt`));
ssm.target = readFileSync(path.join(dir, `target.txt`));
*/

ssm.process({

	source: readFileSync(sourceFile),
	sourceFile,

	target: readFileSync(targetFile),
	targetFile,

});

ssm.computeColumnSpans();

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

//console.dir(ssm.source === ssm.smc.sourceContentFor(ssm.sourceFile))

let mapFile: string = ssm.targetFile;

if (!existsSync(ssm.targetFile))
{
	mapFile = path.join(dir, 'target.txt');
}

writeFileSync(mapFile + '.map', ssm.toString());

let fileContext = `//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYXJzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1RDtBQUV2RCxTQUFnQixZQUFZLENBQUMsS0FBYTtJQUV6QyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQy9DLENBQUM7QUFIRCxvQ0FHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxLQUFhO0lBRXRDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN6QixDQUFDO0FBSEQsOEJBR0M7QUFFRCxTQUFnQixXQUFXLENBQUMsS0FBYTtJQUV4QyxPQUFPLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN0QyxDQUFDO0FBSEQsa0NBR0M7QUFFRCxTQUFnQixZQUFZLENBQUMsS0FBYTtJQUV6QyxJQUFJLENBQUMsR0FBRyxvQ0FBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUUxQyxJQUFJLENBQUMsQ0FBQyxFQUNOO1FBQ0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO0tBQ25EO0lBRUQsSUFBSSxHQUFHLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdCLFFBQVEsR0FBRyxDQUFDLElBQUksRUFDaEI7UUFDQyxLQUFLLHdCQUF3QixDQUFDLE1BQU07WUFDbkMsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQy9CO0lBRUQsT0FBTTtBQUNQLENBQUM7QUFsQkQsb0NBa0JDO0FBRUQsSUFBSyx3QkFJSjtBQUpELFdBQUssd0JBQXdCO0lBRTVCLDZFQUFPLENBQUE7SUFDUCwyRUFBTSxDQUFBO0FBQ1AsQ0FBQyxFQUpJLHdCQUF3QixLQUF4Qix3QkFBd0IsUUFJNUI7QUFFRCxTQUFnQixlQUFlLENBQUMsS0FBYTtJQUU1QyxJQUFJLElBQUksR0FBRyx3QkFBd0IsQ0FBQyxPQUFPLENBQUM7SUFFNUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLG9FQUFvRSxDQUFDLEVBQ3JGO1FBQ0MsS0FBSyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDbEIsSUFBSSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQztLQUN2QztJQUVELE9BQU87UUFDTixJQUFJO1FBQ0osS0FBSztLQUNMLENBQUE7QUFDRixDQUFDO0FBZEQsMENBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleHRyYWN0U291cmNlTWFwRnJvbVRhcmdldCB9IGZyb20gJy4vZXh0cmFjdCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVCYXNlNjQodmFsdWU6IHN0cmluZylcbntcblx0cmV0dXJuIEJ1ZmZlci5mcm9tKHZhbHVlLCAnYmFzZTY0JykudG9TdHJpbmcoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKU09OKHZhbHVlOiBzdHJpbmcpXG57XG5cdHJldHVybiBKU09OLnBhcnNlKHZhbHVlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCYXNlNjQodmFsdWU6IHN0cmluZylcbntcblx0cmV0dXJuIHBhcnNlSlNPTihkZWNvZGVCYXNlNjQodmFsdWUpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb21tZW50KHZhbHVlOiBzdHJpbmcpXG57XG5cdGxldCBzID0gZXh0cmFjdFNvdXJjZU1hcEZyb21UYXJnZXQodmFsdWUpO1xuXG5cdGlmICghcylcblx0e1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYHNvdXJjZW1hcCBjb21tZW50IG5vdCBleGlzdHNgKVxuXHR9XG5cblx0bGV0IGNoayA9IF9jaGtDb21tZW50VHlwZShzKTtcblxuXHRzd2l0Y2ggKGNoay50eXBlKVxuXHR7XG5cdFx0Y2FzZSBFbnVtU291cmNlTWFwQ29tbWVudFR5cGUuQkFTRTY0OlxuXHRcdFx0cmV0dXJuIHBhcnNlQmFzZTY0KGNoay52YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm5cbn1cblxuZW51bSBFbnVtU291cmNlTWFwQ29tbWVudFR5cGVcbntcblx0REVGQVVMVCxcblx0QkFTRTY0LFxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2Noa0NvbW1lbnRUeXBlKHZhbHVlOiBzdHJpbmcpXG57XG5cdGxldCB0eXBlID0gRW51bVNvdXJjZU1hcENvbW1lbnRUeXBlLkRFRkFVTFQ7XG5cblx0aWYgKHZhbHVlLm1hdGNoKC9eZGF0YTooPzphcHBsaWNhdGlvbnx0ZXh0KVxcL2pzb247KD86Y2hhcnNldFs6PV1cXFMrPzspP2Jhc2U2NCwoLiopJC8pKVxuXHR7XG5cdFx0dmFsdWUgPSBSZWdFeHAuJDE7XG5cdFx0dHlwZSA9IEVudW1Tb3VyY2VNYXBDb21tZW50VHlwZS5CQVNFNjQ7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHR5cGUsXG5cdFx0dmFsdWUsXG5cdH1cbn1cbiJdfQ==`;

let a = new SourceMapConsumer(parseComment(fileContext).value);

let b = SourceMapGenerator.fromSourceMap(a);

console.dir(b.toJSON())

console.dir(b.toString())

let c = LazySourceMap.fromContext(fileContext);

console.dir(c.toComment())

