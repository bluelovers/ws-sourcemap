/**
 * Created by User on 2019/12/26.
 */

// @ts-ignore
/// <reference types="mocha" />
// @ts-ignore
/// <reference types="benchmark" />
// @ts-ignore
/// <reference types="chai" />
// @ts-ignore
/// <reference types="node" />

// @ts-ignore
import { chai, relative, expect, path, assert, util, mochaAsync, SymbolLogOutput, rootDir } from './_local-dev';
import { StringSourceMap } from '../lib/index';
import { readFileSync } from 'fs-extra';
import _testDataSetting from './res';

// @ts-ignore
describe(relative(__filename), () =>
{
	// @ts-ignore
	let currentTest: Mocha.Test;

	// @ts-ignore
	beforeEach(function ()
	{
		// @ts-ignore
		currentTest = this.currentTest;

		delete currentTest[SymbolLogOutput];

		//console.log('it:before', currentTest.title);
		//console.log('it:before', currentTest.fullTitle());
	});

	// @ts-ignore
	afterEach(function ()
	{
		let out = currentTest[SymbolLogOutput];
		let t = typeof out;

		if (t === 'string')
		{
			console.log(`----------`);
			console.log(out);
			console.log(`----------`);
		}
		else if (t === 'function')
		{
			out(currentTest)
		}
		else if (out != null)
		{
			console.dir(out);
		}

	});

	Object.entries(_testDataSetting)
		.forEach(([id , testData]) => {

		// @ts-ignore
		describe(`${id}`, () =>
		{
			let ssm = new StringSourceMap();

			// @ts-ignore
			before(async function ()
			{
				let dir = path.join(rootDir, 'test', 'res', id);

				ssm.source = readFileSync(path.join(dir, `source.txt`));
				ssm.target = readFileSync(path.join(dir, `target.txt`));

				return ssm.process();
			});

			// @ts-ignore
			it(`originalPositionFor`, function ()
			{
				//console.log('it:inner', currentTest.title);
				//console.log('it:inner', currentTest.fullTitle());

				let actual = ssm.originalPositionFor(testData.originalPositionFor.actual);
				let expected = testData.originalPositionFor.expected;

				currentTest[SymbolLogOutput] = actual;

				//expect(actual).to.be.ok;
				expect(actual).to.have.deep.include(expected);
				//assert.isOk(actual.value, util.inspect(actual));
			});

			// @ts-ignore
			it(`generatedPositionFor`, function ()
			{
				//console.log('it:inner', currentTest.title);
				//console.log('it:inner', currentTest.fullTitle());

				let actual = ssm.generatedPositionFor(testData.generatedPositionFor.actual);
				let expected = testData.generatedPositionFor.expected;

				currentTest[SymbolLogOutput] = actual;

				//expect(actual).to.be.ok;
				expect(actual).to.have.deep.include(expected);
				//assert.isOk(actual.value, util.inspect(actual));
			});

			it(`sourceContent`, () => {

				let actual = ssm.smc.sourceContentFor(ssm.sourceFile);
				let expected = ssm.source;

				expect(actual).to.have.deep.include(expected);
			});

		});

	});

});
