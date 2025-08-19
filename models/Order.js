import mongoose from "mongoose";
const OrderSchema = new mongoose.Schema({
  orderId: String,
  courierOrderId: String,
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  courier: { type: mongoose.Schema.Types.ObjectId, ref: "Courier" },
  quantity: Number,
  paymentType: { type: String, enum: ["COD", "Prepaid"] },
  dispatched: Boolean,
  paymentDone: Boolean,
  returned: Boolean,
  review: String,
  revenue: Number,
  totalCost: Number,
  profit: Number
});
export default mongoose.model("Order", OrderSchema);
