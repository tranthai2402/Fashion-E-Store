import {
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  Images,
  ShoppingBasket,
  Users,
  Tag,
  BadgePercent,
  Star,
  ImagePlay,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },
  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: <Users />,
  },
  {
    id: "features",
    label: "Feature Images",
    path: "/admin/features",
    icon: <ImagePlay />,
  },
  {
    id: "lookbook",
    label: "Lookbook",
    path: "/admin/lookbook",
    icon: <Images />,
  },
  {
    id: "promotions",
    label: "Sales & Promotions",
    path: "/admin/promotions",
    icon: <Tag />,
  },
  {
    id: "newsletter",
    label: "Newsletter & Emails",
    path: "/admin/newsletter",
    icon: <BadgePercent />,
  },
  {
    id: "bestsellers",
    label: "Bestsellers",
    path: "/admin/bestsellers",
    icon: <Star />,
  },
  {
    id: "sales",
    label: "Hot Sale Products",
    path: "/admin/sales",
    icon: <Tag />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path;

        return (
          <div
            key={menuItem.id}
            onClick={() => {
              navigate(menuItem.path);
              setOpen ? setOpen(false) : null;
            }}
            className={`flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 transition-all duration-200 ${isActive
                ? "bg-sky-200 text-sky-950 font-bold shadow-sm"
                : "text-sky-900 hover:bg-sky-200 hover:text-sky-950"
              }`}
          >
            {menuItem.icon}
            <span>{menuItem.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 bg-sky-100 text-sky-900 border-sky-200">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5 text-sky-900">
                <ChartNoAxesCombined size={30} />
                <h1 className="text-2xl font-extrabold">Admin Panel</h1>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r border-sky-200 bg-sky-100 p-6 lg:flex sticky top-0 h-screen overflow-y-auto shadow-md">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-2 text-sky-900 hover:text-sky-600 transition-colors"
        >
          <ChartNoAxesCombined size={30} />
          <h1 className="text-2xl font-extrabold">Admin Panel</h1>
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
