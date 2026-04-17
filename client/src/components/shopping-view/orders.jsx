import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  console.log(orderDetails, "orderDetails");

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gray-900">
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="h-10 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                Order Code
              </TableHead>
              <TableHead className="h-10 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                Order Date
              </TableHead>
              <TableHead className="h-10 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                Order Status
              </TableHead>
              <TableHead className="h-10 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                Order Price
              </TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => (
                  <TableRow key={orderItem?._id} className="border-b border-gray-100">
                    <TableCell className="py-3 text-[11px] uppercase tracking-[0.14em] text-gray-800">
                      {orderItem?.orderCode || "—"}
                    </TableCell>
                    <TableCell className="py-3 text-[11px] tracking-[0.1em] text-gray-600">
                      {orderItem?.orderDate?.split("T")?.[0] || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${
                          orderItem?.orderStatus === "confirmed" ? "bg-blue-600 hover:bg-blue-700" :
                          orderItem?.orderStatus === "inProcess" ? "bg-cyan-600 hover:bg-cyan-700" :
                          orderItem?.orderStatus === "inShipping" ? "bg-indigo-600 hover:bg-indigo-700" :
                          orderItem?.orderStatus === "delivered" ? "bg-green-600 hover:bg-green-700" :
                          orderItem?.orderStatus === "rejected" ? "bg-red-600 hover:bg-red-700" :
                          orderItem?.orderStatus === "pending" ? "bg-yellow-600 hover:bg-yellow-700" :
                          "bg-gray-900"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-[11px] tracking-[0.1em] text-gray-900">
                      ${orderItem?.totalAmount}
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                          className="h-8 rounded-none bg-black px-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white hover:bg-gray-800"
                        >
                          View Details
                        </Button>
                        <ShoppingOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-[10px] uppercase tracking-[0.22em] text-gray-400"
                  >
                    No orders yet
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
