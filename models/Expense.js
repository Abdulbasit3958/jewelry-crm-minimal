import mongoose from "mongoose";
const ExpenseSchema = new mongoose.Schema({
  name: String,
  amount: Number
});
export default mongoose.model("Expense", ExpenseSchema);
