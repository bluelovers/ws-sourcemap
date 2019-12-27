// @ts-ignore
import { chai, relative, expect, path, assert, util, mochaAsync, SymbolLogOutput, rootDir } from './_local-dev';
import { StringSourceMap } from '../lib/index';
import { readFileSync } from 'fs-extra';
import { SourceMapConsumer } from 'source-map';
import diffNovelChars from '../lib/diff/novel';

let ssm = new StringSourceMap({
	diffFunc: diffNovelChars,
});

let id = '002';
let dir = path.join(rootDir, 'test', 'res', id);

let file_src = path.join(dir, `source.txt`);
let file_target = path.join(dir, `target.txt`);

//file_src = 'G:\\Users\\The Project\\nodejs-test\\node-novel2\\dist_novel\\user\\四度目は嫌な死属性魔術師\\00130_第九章　侵犯者の胎動編\\00010_百七十九話　母娘の對話と微妙な再會.txt';
//file_target = 'G:\\Users\\The Project\\nodejs-test\\node-novel2\\dist_novel\\user_out\\四度目は嫌な死属性魔術師\\00130_第九章　侵犯者の胎動編\\00010_百七十九話　母娘の對話と微妙な再會.txt';

/*
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
	//bias: SourceMapConsumer.LEAST_UPPER_BOUND,
	bias: SourceMapConsumer.GREATEST_LOWER_BOUND,
};

let origPos = ssm.originalPositionFor(genPos);

let genPosAll = ssm.allGeneratedPositionsFor(origPos);

console.dir({
	genPos,
	origPos,
	genPosAll,
});

console.dir(ssm.originalLines(origPos));

console.dir(ssm.originalLineFor(genPos));

//console.dir(ssm)
