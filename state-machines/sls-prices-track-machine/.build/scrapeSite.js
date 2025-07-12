"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const axios_1 = __importDefault(require("axios"));
const handler = async (event) => {
    const response = await axios_1.default.get(event.url);
    return {
        html: response.data,
        meta: event.meta,
    };
};
exports.handler = handler;
