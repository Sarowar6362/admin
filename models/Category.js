import mongoose, { model, Schema, models } from "mongoose";

const ProductSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },  // Ensure description is always a string
  price: { type: Number, required: true, min: 0 },  // Optional: enforce non-negative price
  images: { type: [String], default: [] },  // Ensure images is always an array
  category: { type: mongoose.Types.ObjectId, ref: 'Category', index: true },  // Index for faster category lookups
  properties: { type: Object, default: {} },  // Ensure properties is always an object
}, {
  timestamps: true,
});

export const Product = models.Product || model('Product', ProductSchema);
