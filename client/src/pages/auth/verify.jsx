import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Mail } from "lucide-react";

function AuthVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast({
        title: "Không tìm thấy thông tin email.",
        variant: "destructive",
      });
      navigate("/auth/register");
    }
  }, [email, navigate, toast]);

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gray-100 rounded-full scale-150 animate-pulse" />
          <div className="relative bg-white p-6 rounded-full border border-gray-100 shadow-sm">
            <Mail className="w-12 h-12 text-gray-900" strokeWidth={1} />
          </div>
        </div>
      </div>

      <h1
        className="text-4xl font-bold tracking-tight text-gray-900 mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        CHECK YOUR EMAIL
      </h1>
      
      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-8 leading-relaxed">
        Chúng tôi đã gửi một liên kết xác nhận tới <br />
        <span className="text-gray-900 font-semibold">{email}</span>
      </p>

      <div className="bg-gray-50 border border-gray-100 p-8 mb-10 text-left">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-4">
          Hướng dẫn tiếp theo:
        </h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-gray-900 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-normal uppercase tracking-wider">
              Kiểm tra hộp thư đến (Inbox) của bạn
            </p>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-gray-900 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-normal uppercase tracking-wider">
              Nhấn vào nút <span className="font-bold text-gray-900">"Xác thực tài khoản"</span>
            </p>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-gray-900 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-normal uppercase tracking-wider">
              Bạn sẽ được tự động đăng nhập vào hệ thống
            </p>
          </li>
        </ul>
      </div>

      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-10">
        Không nhận được email? Kiểm tra thư mục Spam hoặc <br />
        <button className="text-gray-900 font-bold hover:underline underline-offset-4 mt-2 transition-all">
          Gửi lại link xác nhận
        </button>
      </p>

      <div className="pt-6 border-t border-gray-100">
        <button
          onClick={() => navigate("/auth/login")}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors"
        >
          Quay lại trang đăng nhập
        </button>
      </div>
    </div>
  );
}

export default AuthVerify;
