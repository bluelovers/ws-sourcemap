export declare function decodeBase64(value: string): string;
export declare function parseJSON<T extends any>(value: string): T;
export declare function parseBase64<T extends any>(value: string): T;
export declare function parseComment<T extends any>(valueInput: string): {
    type: EnumSourceMapCommentType.BASE64;
    value: T;
    file?: undefined;
} | {
    type: EnumSourceMapCommentType.DEFAULT;
    file: string;
    value?: undefined;
};
export declare enum EnumSourceMapCommentType {
    DEFAULT = 0,
    BASE64 = 1
}
export declare function chkCommentType(value: string): {
    type: EnumSourceMapCommentType;
    value: string;
};
