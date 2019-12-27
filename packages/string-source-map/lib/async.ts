import { RawSourceMap, SourceMapConsumer } from 'source-map';
import Bluebird from 'bluebird';
import createSourceMapConsumerSync from './sync';
import { SourceMap } from 'magic-string';

// 1 Transform the type to flag all the undesired keys as 'never'
type FlagExcludedType<Base, Type> = { [Key in keyof Base]: Base[Key] extends Type ? never : Key };

// 2 Get the keys that are not flagged as 'never'
type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];

// 3 Use this with a simple Pick to get the right interface, excluding the undesired type
type OmitType<Base, Type> = Pick<Base, AllowedNames<Base, Type>>;

type PickType<Base, Type> = Omit<Base, AllowedNames<Base, Type>>;

// 4 Exclude the Function type to only get properties
type ConstructorType<T> = OmitType<T, Function>;

type IPromisifyAll<T, K extends keyof PickType<T, Function> = keyof PickType<T, Function>> = OmitType<T, Function> & {
	[P in K]: (...argv: Parameters<T[P]>) => Bluebird<ReturnType<T[P]>>
}

export function createSourceMapConsumerASync(sourcemap: RawSourceMap | SourceMap)
{
	let smc = createSourceMapConsumerSync(sourcemap);

	return wrapSourceMapConsumerASync(smc)
}

export function wrapSourceMapConsumerASync<T extends SourceMapConsumer>(smc: T)
{
	return Bluebird.promisifyAll(smc, {
		suffix: '',
		filter(name) {
			return typeof smc[name] === 'function'
		},
	}) as any as IPromisifyAll<T>
}

export default createSourceMapConsumerASync
