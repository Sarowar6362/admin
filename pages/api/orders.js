// import {mongooseConnect} from "@/lib/mongoose";
// import {Order} from "@/models/Order";

// export default async function handler(req,res) {
//   await mongooseConnect();
//   res.json(await Order.find().sort({createdAt:-1}));
// }


import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export const maxDuration = 300;
export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    try {
      const totalOrders = await Order.countDocuments();
      const totalPages = Math.ceil(totalOrders / limit);
      const orders = await Order.find()
        .populate({
          path: 'line_items.product',
          select: 'title category price',
          populate: { path: 'category', select: 'name' },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.status(200).json({ orders, totalPages });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    // console.log("Deleting order with ID:", id);  // Log the ID to check
  
    try {
      if (!id) return res.status(400).json({ message: "Order ID is required" });
      await Order.findByIdAndDelete(id);
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  }
   else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
