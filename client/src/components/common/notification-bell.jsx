import { Bell, Trash2, CheckCircle, Package, Tag, Info } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  markAsRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
} from "@/store/common/notification-slice";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

function NotificationBell({ isOverlay = false }) {
  const { notifications, unreadCount, isLoading } = useSelector(
    (state) => state.notifications
  );
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const iconClass = isOverlay
    ? "text-white/90 hover:text-white"
    : "text-gray-600 hover:text-black";

  function handleMarkAsRead(id, isRead) {
    if (!isRead) {
      dispatch(markAsRead(id));
    }
  }

  function handleMarkAllAsRead() {
    if (user?.id || user?._id) {
      dispatch(markAllRead(user.id || user._id));
    }
  }

  function handleDelete(id) {
    dispatch(deleteNotification(id));
  }

  function handleClearAll() {
    if (user?.id || user?._id) {
      dispatch(clearAllNotifications(user.id || user._id));
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "promotion":
        return <Tag className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className={`relative ${iconClass} transition-all duration-300 bg-transparent border-none cursor-pointer hover:scale-110 active:scale-95`}>
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span
              className={`absolute -top-1.5 -right-1.5 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold animate-pulse ${isOverlay ? "bg-white text-black" : "bg-red-500 text-white"
                }`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] p-0 shadow-2xl border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-50/50">
          <DropdownMenuLabel className="text-sm font-bold tracking-tight">Thông báo</DropdownMenuLabel>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 text-[10px] px-2 font-medium hover:bg-white"
              >
                Đánh dấu tất cả là đã đọc
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <ScrollArea className="h-[350px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`group relative flex gap-3 p-4 transition-all duration-200 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${!notification.isRead ? "bg-blue-50/30" : ""
                    }`}
                  onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className={`p-2 rounded-full ${notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pr-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] leading-tight ${!notification.isRead ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      )}
                    </div>
                    <span className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                      {notification.message}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 capitalize">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-300 hover:text-red-500 bg-transparent border-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Chưa có thông báo nào
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Chúng tôi sẽ thông báo cho bạn khi có tin mới
              </p>
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 bg-gray-50/30 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full text-xs text-gray-500 hover:text-gray-900 font-medium h-9"
              onClick={() => setOpen(false)}
            >
              Đóng
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
