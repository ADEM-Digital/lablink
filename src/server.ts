import dotenv from "dotenv";
import createServer from "./utils/server";


// Configuration
dotenv.config();
const port = process.env.PORT || 3000;
const app = createServer();

console.log("Running server")
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
