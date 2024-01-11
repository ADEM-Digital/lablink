import dotenv from "dotenv";
import createServer from "./utils/server";
import database from "../src/database/mongodb";


// Configuration
dotenv.config();
database;
const port = process.env.PORT || 3000;
const app = createServer();

console.log("Running server")
export const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


export default app;
