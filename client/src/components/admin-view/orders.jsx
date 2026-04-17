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
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "../ui/input";

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const lastPage = totalPages;
  const lastTwo = [lastPage - 1, lastPage];

  if (currentPage <= 2) {
    return [1, 2, 3, "ellipsis", ...lastTwo];
  }

  if (currentPage === 3) {
    return [1, 2, 3, 4, "ellipsis", ...lastTwo];
  }

  if (currentPage >= 4 && currentPage <= lastPage - 3) {
    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      ...lastTwo,
    ];
  }

  return [1, "ellipsis", lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
}

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' for newest first, 'asc' for oldest first
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  function handleSortByDate() {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  }

  const filteredAndSortedOrderList =
    orderList && orderList.length > 0
      ? [...orderList]
          .filter((orderItem) => {
            if (searchTerm === "") return true;
            return (
              orderItem?.userName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              orderItem?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          })
          .sort((a, b) => {
            const dateA = new Date(a.orderDate);
            const dateB = new Date(b.orderDate);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
          })
      : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, orderList]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedOrderList.length / itemsPerPage)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredAndSortedOrderList.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const pageButtons = getPaginationItems(safeCurrentPage, totalPages);

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-xl font-bold">All Orders</CardTitle>
        <div className="relative w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer or email..."
            className="pl-8 bg-background"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 min-h-[520px]">
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Customer Email</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={handleSortByDate}
                >
                  <div className="flex items-center gap-2">
                    Order Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Order Price</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders && paginatedOrders.length > 0
                ? paginatedOrders.map((orderItem) => (
                    <TableRow key={orderItem?._id}>
                      <TableCell>{orderItem?.orderCode || "-"}</TableCell>
                      <TableCell>{orderItem?.userName}</TableCell>
                      <TableCell>{orderItem?.email}</TableCell>
                      <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                      <TableCell>
                        <Badge
                          className={`py-1 px-3 ${
                            orderItem?.orderStatus === "confirmed" ? "bg-blue-500 hover:bg-blue-600" :
                            orderItem?.orderStatus === "inProcess" ? "bg-cyan-500 hover:bg-cyan-600" :
                            orderItem?.orderStatus === "inShipping" ? "bg-indigo-500 hover:bg-indigo-600" :
                            orderItem?.orderStatus === "delivered" ? "bg-green-500 hover:bg-green-600" :
                            orderItem?.orderStatus === "rejected" ? "bg-red-600 hover:bg-red-700" :
                            orderItem?.orderStatus === "pending" ? "bg-yellow-500 hover:bg-yellow-600" :
                            "bg-black"
                          }`}
                        >
                          {orderItem?.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>${orderItem?.totalAmount}</TableCell>
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
                          >
                            View Details
                          </Button>
                          <AdminOrderDetailsView orderDetails={orderDetails} />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {filteredAndSortedOrderList.length === 0 ? 0 : startIndex + 1}
            {" - "}
            {Math.min(startIndex + itemsPerPage, filteredAndSortedOrderList.length)} of{" "}
            {filteredAndSortedOrderList.length}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            {pageButtons.map((page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={page === safeCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
