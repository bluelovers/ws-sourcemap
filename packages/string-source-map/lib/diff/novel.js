"use strict";
/**
 * Created by user on 2019/12/27.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const diff_1 = require("diff");
const regexp_cjk_1 = __importDefault(require("regexp-cjk"));
const regexp_cjk_plugin_escape_unicode_property_1 = __importDefault(require("regexp-cjk-plugin-escape-unicode-property"));
const regexp_cjk_plugin_extra_1 = __importDefault(require("regexp-cjk-plugin-extra"));
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const _local_dev_1 = require("../../test/_local-dev");
const uni_string_1 = __importDefault(require("uni-string"));
let zhRegExp = regexp_cjk_1.default.use({
    flags: 'u',
    onCore: [
        regexp_cjk_plugin_escape_unicode_property_1.default({
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
        regexp_cjk_plugin_extra_1.default({
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
});
class DiffNovel extends diff_1.Diff {
    tokenize(value) {
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
        let ls = uni_string_1.default.split(value, '');
        fs_extra_1.outputJSONSync(path_1.default.join(_local_dev_1.rootDir, 'test/temp', `diff.ls.json`), ls, {
            spaces: 2,
        });
        return ls;
    }
}
exports.DiffNovel = DiffNovel;
exports.novelDiff = new DiffNovel();
function diffNovelChars(oldStr, newStr, options) {
    return exports.novelDiff.diff(oldStr, newStr, options);
}
exports.diffNovelChars = diffNovelChars;
exports.default = diffNovelChars;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm92ZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJub3ZlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7O0FBRUgsK0JBQXlDO0FBQ3pDLDREQUFtQztBQUNuQywwSEFBaUY7QUFDakYsc0ZBQXVGO0FBQ3ZGLHVDQUEwQztBQUMxQyxnREFBd0I7QUFDeEIsc0RBQWdEO0FBQ2hELDREQUFnQztBQUVoQyxJQUFJLFFBQVEsR0FBRyxvQkFBUyxDQUFDLEdBQUcsQ0FBQztJQUM1QixLQUFLLEVBQUUsR0FBRztJQUNWLE1BQU0sRUFBRTtRQUNQLG1EQUF3QixDQUFDO1lBQ3hCOztlQUVHO1lBQ0gsa0JBQWtCO1lBQ2xCOzs7ZUFHRztZQUNILFVBQVUsRUFBRSxJQUFJO1NBQ2hCLENBQUM7S0FDRjtJQUNELEVBQUUsRUFBRTtRQUNILGlDQUFvQixDQUFDO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDaEIsQ0FBQztLQUNGO0NBQ0QsQ0FBQyxDQUFDO0FBRUgsSUFBSSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsc05BQXNOLENBQUMsQ0FBQztBQUU5TyxNQUFNLEdBQUcsR0FBRyxJQUFJLFFBQVEsQ0FBQyx3R0FBd0csQ0FBQyxDQUFDO0FBRW5JLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ1gsRUFBRTtDQUNGLENBQUMsQ0FBQTtBQUVGLE1BQWEsU0FBVSxTQUFRLFdBQUk7SUFFbEMsUUFBUSxDQUFDLEtBQWE7UUFFdkIsa0JBQWtCO1FBQ2xCLGVBQWU7UUFDZiwyQkFBMkI7UUFDM0Isd0JBQXdCO1FBQ3hCLEVBQUU7UUFDRixzREFBc0Q7UUFDdEQsZ0JBQWdCO1FBQ2hCLEVBQUU7UUFDRixjQUFjO1FBQ2QsdUJBQXVCO1FBQ3ZCLEtBQUs7UUFFSCxJQUFJLEVBQUUsR0FBRyxvQkFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFbEMseUJBQWMsQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFPLEVBQUUsV0FBVyxFQUFFLGNBQWMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUNuRSxNQUFNLEVBQUUsQ0FBQztTQUNULENBQUMsQ0FBQztRQUVILE9BQU8sRUFBRSxDQUFBO0lBQ1YsQ0FBQztDQUNEO0FBeEJELDhCQXdCQztBQUVZLFFBQUEsU0FBUyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7QUFFekMsU0FBZ0IsY0FBYyxDQUFDLE1BQWMsRUFBRSxNQUFjLEVBQUUsT0FBcUI7SUFFbkYsT0FBTyxpQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQy9DLENBQUM7QUFIRCx3Q0FHQztBQUVELGtCQUFlLGNBQWMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMTIvMjcuXG4gKi9cblxuaW1wb3J0IHsgRGlmZiwgQmFzZU9wdGlvbnMgfSBmcm9tICdkaWZmJztcbmltcG9ydCBfemhSZWdFeHAgZnJvbSAncmVnZXhwLWNqayc7XG5pbXBvcnQgY3JlYXRlWmhSZWdFeHBDb3JlUGx1Z2luIGZyb20gJ3JlZ2V4cC1jamstcGx1Z2luLWVzY2FwZS11bmljb2RlLXByb3BlcnR5JztcbmltcG9ydCBjcmVhdGVaaFJlZ0V4cFBsdWdpbiwgeyBJWmhSZWdFeHBQbHVnaW5PcHRpb25zIH0gZnJvbSAncmVnZXhwLWNqay1wbHVnaW4tZXh0cmEnO1xuaW1wb3J0IHsgb3V0cHV0SlNPTlN5bmMgfSBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgcm9vdERpciB9IGZyb20gJy4uLy4uL3Rlc3QvX2xvY2FsLWRldic7XG5pbXBvcnQgVVN0cmluZyBmcm9tICd1bmktc3RyaW5nJ1xuXG5sZXQgemhSZWdFeHAgPSBfemhSZWdFeHAudXNlKHtcblx0ZmxhZ3M6ICd1Jyxcblx0b25Db3JlOiBbXG5cdFx0Y3JlYXRlWmhSZWdFeHBDb3JlUGx1Z2luKHtcblx0XHRcdC8qKlxuXHRcdFx0ICoganVzdCBkbyBpdFxuXHRcdFx0ICovXG5cdFx0XHQvL2VzY2FwZUFsbDogdHJ1ZSxcblx0XHRcdC8qKlxuXHRcdFx0ICogYXV0byBkZXRlY3QgZG8gb3Igbm90XG5cdFx0XHQgKiBAZGVmYXVsdCB0cnVlXG5cdFx0XHQgKi9cblx0XHRcdGVzY2FwZUF1dG86IHRydWUsXG5cdFx0fSksXG5cdF0sXG5cdG9uOiBbXG5cdFx0Y3JlYXRlWmhSZWdFeHBQbHVnaW4oe1xuXHRcdFx0YXV0b1ZvaWNlOiB0cnVlLFxuXHRcdFx0YXV0b0Z1bGxIYWlmOiB0cnVlLFxuXHRcdFx0YXV0b0RlYnVycjogdHJ1ZSxcblx0XHR9KVxuXHRdXG59KTtcblxubGV0IHJlID0gbmV3IHpoUmVnRXhwKC8oXFxufFtcXHhBMFxcc118W+OCoS3jg7Tjg7zvvbEt776d776e772wXSt8W1wiKHtcXFtcXF19KTw+4oC54oC6wqvCu+OAjOOAjeKAmOKAmeKAnOKAnSfjgJDjgJHjgIrjgIvjgI7jgI/vvIjvvIldK3xb77yM44CC77yB4oCm4ouv77yf772efj8hXFwu4oCU4pSAXSt8W1xcdTRFMDAtXFx1OUZGRlxcdXsyMDAwMH0tXFx1ezJGQTFGfV18W1xcd1xcdTAxMDAtXFx1MDE3RlxcdTA0MDAtXFx1MDRGRlxcdTAwQTEtXFx1MDBGRlxcdTAxODAtXFx1MDI0Zu+8kC3vvJnvvYEt772aXSt8W1xccHtTY3JpcHRfRXh0ZW5zaW9ucz1IaXJhZ2FuYX1dKS9pdSk7XG5cbmNvbnN0IHJlMiA9IG5ldyB6aFJlZ0V4cCgvKFxcbit8W1wiKHtcXFtcXF19KTw+4oC54oC6wqvCu+OAjOOAjeKAmOKAmeKAnOKAnSfjgJDjgJHjgIrjgIvjgI7jgI/vvIjvvInvvIzjgILvvIHigKbii6/vvJ/vvZ5+PyFcXC7igJTilIAsXFxwe1B9XFxwe1BjfVxccHtQZH1cXHB7UGV9XFxwe1BmfVxccHtQaX1cXHB7UG99XFxwe1BzfV0pL2l1KTtcblxucmUgPSBuZXcgemhSZWdFeHAoLyhcXG58LikvaXUpO1xuXG5jb25zb2xlLmRpcih7XG5cdHJlLFxufSlcblxuZXhwb3J0IGNsYXNzIERpZmZOb3ZlbCBleHRlbmRzIERpZmZcbntcblx0dG9rZW5pemUodmFsdWU6IHN0cmluZylcblx0e1xuLy9cdFx0bGV0IGxzID0gdmFsdWVcbi8vXHRcdFx0LnNwbGl0KHJlKVxuLy9cdFx0XHQuZmlsdGVyKHYgPT4gdiAhPT0gJycpXG4vL1x0XHRcdC5yZWR1Y2UoKGEsIHYpID0+IHtcbi8vXG4vL1x0XHRcdFx0Ly9hLnB1c2goLi4udi5zcGxpdChyZTIpLmZpbHRlcih2ID0+IHYgIT09ICcnKSk7XG4vL1x0XHRcdFx0YS5wdXNoKHYpO1xuLy9cbi8vXHRcdFx0XHRyZXR1cm4gYVxuLy9cdFx0XHR9LCBbXSBhcyBzdHJpbmdbXSlcbi8vXHRcdDtcblxuXHRcdGxldCBscyA9IFVTdHJpbmcuc3BsaXQodmFsdWUsICcnKTtcblxuXHRcdG91dHB1dEpTT05TeW5jKHBhdGguam9pbihyb290RGlyLCAndGVzdC90ZW1wJywgYGRpZmYubHMuanNvbmApLCBscywge1xuXHRcdFx0c3BhY2VzOiAyLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGxzXG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IG5vdmVsRGlmZiA9IG5ldyBEaWZmTm92ZWwoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZOb3ZlbENoYXJzKG9sZFN0cjogc3RyaW5nLCBuZXdTdHI6IHN0cmluZywgb3B0aW9ucz86IEJhc2VPcHRpb25zKVxue1xuXHRyZXR1cm4gbm92ZWxEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpZmZOb3ZlbENoYXJzXG4iXX0=