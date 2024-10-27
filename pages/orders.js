// import { useEffect, useState } from "react"; // Import useState and useEffect
// import axios from "axios";
// import Layout from "@/components/Layout";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     axios.get('/api/orders').then(response => {
//       setOrders(response.data);
//     });
//   }, []);

//   return (
//     <Layout>
//       <h1>Orders</h1>
//       <table className="basic">
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Paid</th>
//             <th>Recipient</th>
//             <th>Products</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.length > 0 && orders.map(order => (
//             <tr key={order._id}>
//               <td>{(new Date(order.createdAt)).toLocaleString()}</td>
//               <td className={order.paid ? 'text-green-600' : 'text-red-600'}>
//                 {order.paid ? 'YES' : 'NO'}
//               </td>
//               <td>
//                 {order.name} {order.email}<br />
//                 {order.city} {order.postalCode} {order.country}<br />
//                 {order.streetAddress}
//               </td>
//               <td>
//                 {order.line_items.map((l, index) => (
//                   <div key={index}>
//                     {l.title}  x {l.quantity}<br />
//                   </div>
//                 ))}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </Layout>
//   );
// }









import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]); // Initialize orders as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // Number of orders per page

  // Fetch orders with pagination
  const fetchOrders = async (page) => {
    try {
      const response = await axios.get(`/api/orders?page=${page}&limit=${itemsPerPage}`);
      // Validate response structure and set state
      setOrders(response.data?.orders || []); // Default to empty array if undefined
      setTotalPages(response.data?.totalPages || 1); // Default to 1 if undefined
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]); // Ensure orders is an empty array on failure
    }
  };

  // Delete order by ID
  const handleDelete = async (orderId) => {
    try {
      console.log("Attempting to delete order:", orderId);  // Log to verify orderId
      const response = await axios.delete(`/api/orders?id=${orderId}`);
      
      if (response.status === 200) {
        console.log("Order deleted successfully");
        loadOrders(page); // Reload orders after deletion
      } else {
        console.error("Failed to delete order:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };
  

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  return (
    <Layout>
      <h1>Orders</h1>
      <table className="basic">
        <thead>
          <tr>
            <th>Date</th>
            <th>Paid</th>
            <th>Recipient</th>
            <th>Products</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order._id}>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td className={order.paid ? "text-green-600" : "text-red-600"}>
                  {order.paid ? "YES" : "NO"}
                </td>
                <td>
                   Name : {order.name} 
                  <br />
                  Email : {order.email}
                  <br />
                  Phone : {order.postalCode} 
                  <br />
                  Address : {order.streetAddress}
                </td>
                <td>
                  {order.line_items.map((l, index) => (
                    <div key={index}>
                      {l.title} x {l.quantity}
                      <br />
                    </div>
                  ))}
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No orders found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        {currentPage > 1 && (
          <button onClick={() => fetchOrders(currentPage - 1)}>Previous</button>
        )}
        <span style={{ margin: "0 10px" }}>Page {currentPage} of {totalPages}</span>
        {currentPage < totalPages && (
          <button onClick={() => fetchOrders(currentPage + 1)}>Next</button>
        )}
      </div>
    </Layout>
  );
}
