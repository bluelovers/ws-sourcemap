"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapSourceMapConsumerASync = exports.createSourceMapConsumerASync = void 0;
const bluebird_1 = __importDefault(require("bluebird"));
const sync_1 = __importDefault(require("./sync"));
function createSourceMapConsumerASync(sourcemap) {
    let smc = sync_1.default(sourcemap);
    return wrapSourceMapConsumerASync(smc);
}
exports.createSourceMapConsumerASync = createSourceMapConsumerASync;
function wrapSourceMapConsumerASync(smc) {
    return bluebird_1.default.promisifyAll(smc, {
        suffix: '',
        filter(name) {
            return typeof smc[name] === 'function';
        },
    });
}
exports.wrapSourceMapConsumerASync = wrapSourceMapConsumerASync;
exports.default = createSourceMapConsumerASync;
//# sourceMappingURL=async.js.map