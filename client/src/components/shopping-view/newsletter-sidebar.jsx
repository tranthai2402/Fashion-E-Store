import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    setIsSuccess(false);
    setEmail("");
    setOpen(false);
    navigate("/shop/listing");
  };

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="fixed bottom-8 right-8 z-50 flex items-center justify-center group">
          {/* Pulsing ring background */}
          <div className="absolute inset-0 bg-black/20 rounded-full animate-ping scale-110 opacity-75 group-hover:bg-black/30 transition-all"></div>
          
          {/* Floating label on hover */}
          <div className="absolute right-full mr-4 bg-white text-black px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap border border-gray-100">
            Nhận ưu đãi 10% ngay! ✨
          </div>

          <div className="relative bg-black text-white w-16 h-16 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white/20 overflow-visible">
            {/* Badge */}
            <div className="absolute -top-2 -right-2 bg-red-600 text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-lg transform rotate-12 group-hover:rotate-0 transition-all">
              -10%
            </div>
            
            <Gift className="w-6 h-6 mb-0.5 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[8px] font-black uppercase tracking-[0.1em] opacity-90 group-hover:opacity-100">Ưu Đãi</span>
          </div>
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
                   onClick={handleContinueShopping}
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
