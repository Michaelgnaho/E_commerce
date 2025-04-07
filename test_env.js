import dotenv from "dotenv";

dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY);
process.exit();
