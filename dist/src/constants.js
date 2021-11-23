"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const constants = {
    privateKEY: fs_1.default.readFileSync(path_1.default.join(__dirname, './keys/jwtRS256.key'), 'utf8'),
    publicKEY: fs_1.default.readFileSync(path_1.default.join(__dirname, './keys/jwtRS256.key.pub'), 'utf8')
};
exports.default = constants;
