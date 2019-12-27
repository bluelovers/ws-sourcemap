/**
 * Created by user on 2019/12/27.
 */
import { Diff, BaseOptions } from 'diff';
export declare class DiffNovel extends Diff {
    tokenize(value: string): string[];
}
export declare function diffNovelChars(oldStr: string, newStr: string, options?: BaseOptions): import("diff").Change[];
export default diffNovelChars;
