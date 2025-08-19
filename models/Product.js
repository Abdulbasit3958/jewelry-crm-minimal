import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
  name: String,
  productCost: Number,
  packagingCost: Number,
  shippingCost: Number,
  codTax: Number,
  codFeeUs: Number,
  sellingPrice: Number,
  totalCost: Number,
  profitPerUnit: Number
});
export default mongoose.model("Product", ProductSchema);
