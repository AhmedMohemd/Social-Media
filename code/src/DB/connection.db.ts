import { connect } from "mongoose";
import { DB_URI } from "../config/config";
const connectDB = async () => {
  try {
      await connect(DB_URI, { serverSelectionTimeoutMS: 30000 }); 
      console.log("Connected to DB successfully 😍");
    } catch (error) {
        console.error(`Error connecting to DB ❌: ${error}`);
    }
};
export default connectDB;