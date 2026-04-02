import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { Gift, Mail, CheckCircle, XCircle } from "lucide-react";

function NewsletterSidebar() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Vui lòng nhập email hợp lệ",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/newsletter/subscribe",
        { email }
      );

      if (response.data.success) {
        setIsSuccess(true);
        toast({
          title: "Đăng ký thành công!",
          description: "Mã giảm giá đã được gửi vào email của bạn.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: error.response?.data?.message || "Đã có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="fixed right-0 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-l-md shadow-2xl flex flex-col items-center gap-2 hover:bg-gray-800 transition-all z-40">
          <Gift className="w-5 h-5 animate-bounce" />
          <span className="[writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-widest">Nhận Ưu Đãi</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white p-0 overflow-hidden border-l border-gray-100">
        <div className="flex h-full flex-col">
          <div className="h-48 bg-black flex flex-col items-center justify-center text-white p-8 relative">
             <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                {/* Subtle pattern or gradient */}
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-200 via-transparent to-transparent"></div>
             </div>
             <Gift className="w-16 h-16 mb-4 text-white" />
             <h2 className="text-2xl font-bold tracking-[0.1em] uppercase">Mã Giảm Giá 10%</h2>
             <p className="text-[10px] uppercase tracking-[0.2em] opacity-80 mt-2 text-center">Dành riêng cho lần mua hàng đầu tiên</p>
          </div>

          <div className="flex-1 p-8 flex flex-col">
            {!isSuccess ? (
              <>
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-900 mb-4">Chào mừng bạn mới</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Đăng ký nhận bản tin để không bỏ lỡ các bộ sưu tập mới nhất và nhận ngay ưu đãi đặc biệt dành riêng cho bạn.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email cá nhân của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 border-gray-200 focus:border-black rounded-none transition-all"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold uppercase tracking-[0.2em] text-[11px] rounded-none transition-all shadow-lg"
                  >
                    {isLoading ? "Đang xử lý..." : "Nhận Mã Ngay"}
                  </Button>
                </form>

                <p className="mt-6 text-[10px] text-gray-400 text-center uppercase tracking-widest leading-loose">
                  Bằng cách nhấn nút, bạn đồng ý với chính sách quyền riêng tư của chúng tôi.
                </p>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-[0.1em] mb-2">Kiểm tra Hộp thư!</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-8">
                  Mã giảm giá đã được gửi đến <span className="font-bold text-black">{email}</span>. Vui lòng kiểm tra email của bạn để lấy mã và bắt đầu mua sắm.
                </p>
                <Button 
                   onClick={() => setIsSuccess(false)}
                   className="w-full h-12 bg-black text-white hover:bg-gray-800 font-semibold uppercase tracking-[0.2em] text-[11px] rounded-none"
                >
                  Tiếp tục mua hàng
                </Button>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-gray-50 bg-gray-50/50">
             <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                   <div className="text-[10px] font-bold text-black uppercase tracking-tighter">Freeship</div>
                   <div className="text-[8px] text-gray-400 uppercase">Đơn từ $0</div>
                </div>
                <div className="w-[1px] h-4 bg-gray-200"></div>
                <div className="flex flex-col items-center">
                   <div className="text-[10px] font-bold text-black uppercase tracking-tighter">Đổi trả</div>
                   <div className="text-[8px] text-gray-400 uppercase">Trong 30 ngày</div>
                </div>
                <div className="w-[1px] h-4 bg-gray-200"></div>
                <div className="flex flex-col items-center">
                   <div className="text-[10px] font-bold text-black uppercase tracking-tighter">Hỗ trợ</div>
                   <div className="text-[8px] text-gray-400 uppercase">24/7</div>
                </div>
             </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default NewsletterSidebar;
