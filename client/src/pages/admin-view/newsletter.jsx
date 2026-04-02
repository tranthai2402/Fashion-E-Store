import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmails, deleteSubscriber } from "@/store/admin/newsletter-slice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, User, Mail, Gift } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function AdminNewsletter() {
  const { emailList, isLoading } = useSelector((state) => state.adminNewsletter);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllEmails());
  }, [dispatch]);

  const handleDeleteSub = (email) => {
    dispatch(deleteSubscriber(email)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Đã xóa đăng ký bản tin" });
        dispatch(fetchAllEmails());
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Quản lý Gmail & Danh sách ưu đãi</h1>
      </div>

      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Họ tên / Vai trò</TableHead>
              <TableHead className="font-bold">Người dùng Store</TableHead>
              <TableHead className="font-bold">Nhận ưu đãi</TableHead>
              <TableHead className="font-bold text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : emailList && emailList.length > 0 ? (
              emailList.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       <Mail className="w-4 h-4 text-gray-400" />
                       {item.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                      {item.role && (
                        <span className="text-[10px] uppercase text-gray-400 font-bold">{item.role}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.isRegisteredUser ? (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 pointer-events-none">
                        <User className="w-3 h-3 mr-1" /> Có tài khoản
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-300">Khách vãng lai</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.isNewsletterSubscribed ? (
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-green-50 text-green-700 border-green-200 pointer-events-none w-fit">
                          <Gift className="w-3 h-3 mr-1" /> Đã đăng ký
                        </Badge>
                        {item.voucherCode && (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                             Mã: {item.voucherCode}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-200">Chưa đăng ký</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.isNewsletterSubscribed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => handleDeleteSub(item.email)}
                        title="Xóa khỏi danh sách nhận tin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-400">Không có dữ liệu hiển thị</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AdminNewsletter;
