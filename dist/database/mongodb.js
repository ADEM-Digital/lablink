"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.MONGO_DB_CONNECTION_STRING;
const database = mongoose_1.default;
if (connectionString) {
    database
        .connect(connectionString)
        .then((x) => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
        .catch((err) => console.error("Error connecting to mongo", err));
}
exports.default = database;
