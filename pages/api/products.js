import { Product } from "@/models/Product";
import { Category } from "@/models/Category"; // import Category model
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  try {
    await isAdminRequest(req, res);
  } catch (error) {
    console.error('Error in isAdminRequest:', error);
    res.status(401).json({ message: 'Unauthorized access' });
    return;
  }

  if (method === 'GET') {
    try {
      let defaultCategory = await Category.findOne({ name: "Uncategorized" });
      if (!defaultCategory) {
        // Create an "Uncategorized" category if it doesn't exist
        defaultCategory = await Category.create({ name: "Uncategorized" });
      }

      if (req.query?.id) {
        let product = await Product.findOne({ _id: req.query.id }).populate("category");

        // Set category to "Uncategorized" if not found
        if (!product.category) {
          product.category = defaultCategory._id;
          await product.save();
          product = await Product.findOne({ _id: req.query.id }).populate("category");
        }

        res.status(200).json(product);
      } else {
        const products = await Product.find().populate("category").limit(50);
        const productsWithFallback = products.map(product => {
          if (!product.category) {
            product.category = defaultCategory._id;
            product.save(); // update the product
          }
          return product;
        });
        res.status(200).json(productsWithFallback);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Error fetching products' });
    }
  }

  

  if (method === 'POST') {
    try {
      const { title, description, price, images, category, properties } = req.body;
      const productDoc = await Product.create({
        title, description, price, images, category, properties,
      });
      res.status(201).json(productDoc);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Error creating product' });
    }
  }

  if (method === 'PUT') {
    try {
      const { title, description, price, images, category, properties, _id } = req.body;
      await Product.updateOne({ _id }, { title, description, price, images, category, properties });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Error updating product' });
    }
  }

  if (method === 'DELETE') {
    try {
      if (req.query?.id) {
        await Product.deleteOne({ _id: req.query.id });
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ message: 'Product ID is required' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product' });
    }
  }
}
