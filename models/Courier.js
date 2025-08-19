import mongoose from "mongoose";
const CourierSchema = new mongoose.Schema({
  name: String
});
export default mongoose.model("Courier", CourierSchema);
