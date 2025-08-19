import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import Product from "./models/Product.js";
import Courier from "./models/Courier.js";
import Order from "./models/Order.js";
import Expense from "./models/Expense.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// DB connect
mongoose.connect(process.env.MONGO_URI);

// Auth middleware
function auth(req, res, next) {
  if (req.cookies.auth === process.env.APP_PASSWORD) return next();
  return res.redirect("/login");
}

// Routes
app.get("/login", (req, res) => res.render("login"));
app.post("/login", (req, res) => {
  if (req.body.password === process.env.APP_PASSWORD) {
    res.cookie("auth", process.env.APP_PASSWORD);
    return res.redirect("/");
  }
  res.render("login", { error: "Invalid password" });
});

app.get("/", auth, async (req, res) => {
  const products = await Product.find();
  const orders = await Order.find().populate("product courier");
  const expenses = await Expense.find();
  const couriers = await Courier.find();

  // KPIs
  const totalRevenue = orders.reduce((a, o) => a + o.revenue, 0);
  const totalCost = orders.reduce((a, o) => a + o.totalCost, 0);
  const totalProfit = orders.reduce((a, o) => a + o.profit, 0) - expenses.reduce((a, e) => a + e.amount, 0);
  const pendingCOD = orders.filter(o => o.paymentType === "COD" && !o.paymentDone)
                          .reduce((a, o) => a + o.revenue, 0);

  res.render("dashboard", { products, orders, expenses, couriers, totalRevenue, totalCost, totalProfit, pendingCOD });
});

// Add forms
app.post("/products", auth, async (req, res) => {
  const { name, productCost, packagingCost, shippingCost, codTax, codFeeUs, sellingPrice } = req.body;
  const codTaxAmount = (sellingPrice * codTax) / 100;
  const totalCost = Number(productCost) + Number(packagingCost) + Number(shippingCost) + Number(codTaxAmount) + Number(codFeeUs);
  const profitPerUnit = Number(sellingPrice) - totalCost;
  await Product.create({ name, productCost, packagingCost, shippingCost, codTax, codFeeUs, sellingPrice, totalCost, profitPerUnit });
  res.redirect("/");
});

app.post("/couriers", auth, async (req, res) => {
  await Courier.create({ name: req.body.name });
  res.redirect("/");
});

app.post("/orders", auth, async (req, res) => {
  const product = await Product.findById(req.body.product);
  const courier = await Courier.findById(req.body.courier);
  const orderId = "ORD-" + Date.now();
  const courierOrderId = courier.name.substring(0, 2).toUpperCase() + "-" + Date.now();
  const quantity = Number(req.body.quantity);
  const revenue = product.sellingPrice * quantity;
  const totalCost = product.totalCost * quantity;
  const profit = revenue - totalCost;
  await Order.create({ orderId, courierOrderId, product, courier, quantity, paymentType: req.body.paymentType, dispatched: req.body.dispatched==="on", paymentDone: req.body.paymentDone==="on", returned: req.body.returned==="on", review: req.body.review, revenue, totalCost, profit });
  res.redirect("/");
});

app.post("/expenses", auth, async (req, res) => {
  await Expense.create({ name: req.body.name, amount: req.body.amount });
  res.redirect("/");
});

// Server
app.listen(3000, () => console.log("CRM running on http://localhost:3000"));
