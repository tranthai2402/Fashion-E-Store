import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts, editProduct, clearAllSaleItems } from "@/store/admin/products-slice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, Tag, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function AdminSales() {
  const { productList, isLoading } = useSelector((state) => state.adminProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const dispatch = useDispatch();
  const { toast } = useToast();

  const categories = ["ALL", "MEN", "WOMEN", "ACCESSORIES", "FOOTWEAR", "JEWELRY", "HANDBAG"];

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const handleToggleSaleItem = (productId, currentStatus) => {
    dispatch(
      editProduct({
        id: productId,
        formData: { isSaleItem: !currentStatus },
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: !currentStatus 
            ? "Đã thêm vào danh sách Sale nổi bật" 
            : "Đã xóa khỏi danh sách Sale nổi bật",
        });
        dispatch(fetchAllProducts());
      }
    });
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách Sale nổi bật không?"
      )
    ) {
      dispatch(clearAllSaleItems()).then((data) => {
        if (data?.payload?.success) {
          toast({ title: "Đã xóa tất cả sản phẩm khỏi danh sách Sale" });
          dispatch(fetchAllProducts());
        }
      });
    }
  };

  const filteredProductsBySearch = productList.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = selectedCategory === "ALL" 
    ? filteredProductsBySearch 
    : filteredProductsBySearch.filter(p => p.category.toUpperCase() === selectedCategory);

  const saleItems = filteredProducts.filter((product) => product.isSaleItem);
  const otherProducts = filteredProducts.filter((product) => !product.isSaleItem);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Tag className="text-red-500 fill-red-500" /> Quản lý sản phẩm khuyến mãi (Hot Sale)
        </h1>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-8 bg-background"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full px-6 transition-all duration-300"
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Sale Items Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2 capitalize">
              Danh sách Sale Ghim {selectedCategory !== "ALL" ? `- ${selectedCategory}` : ""} ({saleItems.length})
            </h2>
            {saleItems.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Xóa tất cả lựa chọn
              </Button>
            )}
          </div>
          <div className="border rounded-md bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-red-50">
                <TableRow>
                  <TableHead className="w-[100px]">Ảnh</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá/Khuyến mãi</TableHead>
                  <TableHead className="text-right">Ghim Sale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.length > 0 ? (
                  saleItems.map((product) => (
                    <TableRow key={product._id} className="hover:bg-gray-50">
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-red-600 font-bold">${product.salePrice > 0 ? product.salePrice : "Chưa set"}</span>
                          <span className="text-xs line-through text-gray-400">${product.price}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Checkbox
                          checked={product.isSaleItem}
                          onCheckedChange={() => handleToggleSaleItem(product._id, product.isSaleItem)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                      Chưa có sản phẩm nào được ghim vào danh sách Hot Sale.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* All Products Section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-700 capitalize">
            {selectedCategory === "ALL" ? "Tất cả sản phẩm" : `Sản phẩm mục ${selectedCategory}`}
          </h2>
          <div className="border rounded-md bg-white shadow-sm overflow-hidden h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[100px]">Ảnh</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Giá Sale Hiện Tại</TableHead>
                  <TableHead className="text-right">Ghim Sale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : otherProducts.length > 0 ? (
                  otherProducts.map((product) => (
                    <TableRow key={product._id} className="hover:bg-gray-50">
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-sm">{product.title}</TableCell>
                      <TableCell>
                        {product.salePrice > 0 ? (
                          <span className="text-green-600 font-medium">${product.salePrice}</span>
                        ) : (
                          <span className="text-gray-300 text-xs">Không có sale</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSaleItem(product._id, product.isSaleItem)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Tag className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                      Không tìm thấy sản phẩm nào khác
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSales;
