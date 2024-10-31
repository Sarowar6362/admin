import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

let defaultCategory;

async function initializeDefaultCategory() {
  if (!defaultCategory) {
    defaultCategory = await Category.findOne({ name: "Uncategorized" });
    if (!defaultCategory) {
      defaultCategory = await Category.create({ name: "Uncategorized" });
    }
  }
}

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  try {
    await isAdminRequest(req, res);
  } catch (error) {
    console.error('Error in isAdminRequest:', error);
    return res.status(401).json({ message: 'Unauthorized access' });
  }

  await initializeDefaultCategory();

  if (method === 'GET') {
    try {
      if (req.query?.id) {
        // Fetch the product by ID and populate its category
        let product = await Product.findById(req.query.id).populate("category");

        // If product exists but has no category, assign default
        if (product && !product.category) {
          product.category = defaultCategory._id;
          await product.save();
          product = await Product.findById(req.query.id).populate("category");
        }

        // Check if the product still does not have a category
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json(product);
      } else {
        const products = await Product.find().populate("category").limit(50);
        await Promise.all(
          products.map(async (product) => {
            if (!product.category) {
              product.category = defaultCategory._id;
              await product.save();
            }
          })
        );
        return res.status(200).json(products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ message: 'Error fetching products' });
    }
  }

  if (method === 'POST') {
    try {
      const { title, description, price, images, category, properties } = req.body;
      const productDoc = await Product.create({
        title, description, price, images, category: category || defaultCategory._id, properties,
      });
      return res.status(201).json(productDoc);
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ message: 'Error creating product' });
    }
  }

  if (method === 'PUT') {
    try {
      const { title, description, price, images, category, properties, _id } = req.body;
      await Product.updateOne({ _id }, { title, description, price, images, category: category || defaultCategory._id, properties });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ message: 'Error updating product' });
    }
  }

  if (method === 'DELETE') {
    try {
      if (req.query?.id) {
        await Product.deleteOne({ _id: req.query.id });
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ message: 'Product ID is required' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ message: 'Error deleting product' });
    }
  }
}
