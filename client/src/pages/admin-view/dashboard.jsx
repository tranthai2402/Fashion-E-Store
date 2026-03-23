import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import {
  addFeatureImage,
  deleteFeatureImage,
  getFeatureImages,
} from "@/store/common-slice";
import { getRevenueAnalytics, getComparisonAnalytics } from "@/store/admin/analytics-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, ShoppingBag, DollarSign, ArrowRightLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [filter, setFilter] = useState("day");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [period1, setPeriod1] = useState(new Date().toISOString().split("T")[0]);
  const [period2, setPeriod2] = useState(new Date(Date.now() - 86400000).toISOString().split("T")[0]);

  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { totalRevenue, totalUsers, totalOrdersCount, chartData, comparisonData } = useSelector(
    (state) => state.adminAnalytics
  );

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  function handleDeleteFeatureImage(id) {
    dispatch(deleteFeatureImage(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
    if (isCompareMode) {
      dispatch(getComparisonAnalytics({ period1, period2, type: filter }));
    } else {
      dispatch(getRevenueAnalytics(filter));
    }
  }, [dispatch, filter, isCompareMode, period1, period2]);

  const comparisonChartData = isCompareMode && comparisonData ? [
    {
      name: "Revenue ($)",
      [comparisonData.period1.label]: comparisonData.period1.totalRevenue,
      [comparisonData.period2.label]: comparisonData.period2.totalRevenue,
    },
    {
      name: "Orders",
      [comparisonData.period1.label]: comparisonData.period1.totalOrders,
      [comparisonData.period2.label]: comparisonData.period2.totalOrders,
    },
    {
      name: "Customers",
      [comparisonData.period1.label]: comparisonData.period1.uniqueUsers,
      [comparisonData.period2.label]: comparisonData.period2.uniqueUsers,
    },
  ] : [];

  const getDelta = (v1, v2) => {
    if (v2 === 0) return v1 > 0 ? "+100%" : "0%";
    const delta = ((v1 - v2) / v2) * 100;
    return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ... (Existing metric cards) */}
        {!isCompareMode ? (
          <>
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg overflow-hidden border-none relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-6 w-6 opacity-40 absolute -right-0 -top-0 scale-150 rotate-12" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs opacity-70 mt-1">Dựa trên các đơn hàng đã xác nhận</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-teal-400 text-white shadow-lg overflow-hidden border-none relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Customer</CardTitle>
                <Users className="h-6 w-6 opacity-40 absolute -right-0 -top-0 scale-150 rotate-12" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalUsers}</p>
                <p className="text-xs opacity-70 mt-1">Dựa trên số người dùng thanh toán</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg overflow-hidden border-none relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-6 w-6 opacity-40 absolute -right-0 -top-0 scale-150 rotate-12" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalOrdersCount}</p>
                <p className="text-xs opacity-70 mt-1">Tổng số đơn hàng thực hiện</p>
              </CardContent>
            </Card>
          </>
        ) : comparisonData ? (
          <>
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">${comparisonData.period1.totalRevenue.toFixed(2)}</p>
                  <p className={`text-xs font-bold ${comparisonData.period1.totalRevenue >= comparisonData.period2.totalRevenue ? "text-green-500" : "text-red-500"}`}>
                    {getDelta(comparisonData.period1.totalRevenue, comparisonData.period2.totalRevenue)} vs P2
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">P2: ${comparisonData.period2.totalRevenue.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Customer Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">{comparisonData.period1.uniqueUsers}</p>
                  <p className={`text-xs font-bold ${comparisonData.period1.uniqueUsers >= comparisonData.period2.uniqueUsers ? "text-green-500" : "text-red-500"}`}>
                    {getDelta(comparisonData.period1.uniqueUsers, comparisonData.period2.uniqueUsers)} vs P2
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">P2: {comparisonData.period2.uniqueUsers}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Orders Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">{comparisonData.period1.totalOrders}</p>
                  <p className={`text-xs font-bold ${comparisonData.period1.totalOrders >= comparisonData.period2.totalOrders ? "text-green-500" : "text-red-500"}`}>
                    {getDelta(comparisonData.period1.totalOrders, comparisonData.period2.totalOrders)} vs P2
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">P2: {comparisonData.period2.totalOrders}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-3 h-24 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
            Loading comparison data...
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CardTitle>Thống kê doanh thu</CardTitle>
            <div className="flex items-center space-x-2 border px-3 py-1 rounded-full bg-muted/30">
              <Checkbox
                id="compareMode"
                checked={isCompareMode}
                onCheckedChange={(checked) => setIsCompareMode(checked)}
              />
              <Label htmlFor="compareMode" className="text-xs font-semibold cursor-pointer flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" /> So sánh
              </Label>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Đơn vị:</span>
              <Select 
                value={filter} 
                onValueChange={(value) => {
                  setFilter(value);
                  // Reset periods with appropriate formats when filter changes
                  const now = new Date();
                  if (value === "day") {
                    setPeriod1(now.toISOString().split("T")[0]);
                    setPeriod2(new Date(Date.now() - 86400000).toISOString().split("T")[0]);
                  } else if (value === "month") {
                    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
                    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const prevMonth = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, "0")}`;
                    setPeriod1(currentMonth);
                    setPeriod2(prevMonth);
                  } else if (value === "year") {
                    setPeriod1(now.getFullYear().toString());
                    setPeriod2((now.getFullYear() - 1).toString());
                  }
                }}
              >
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue placeholder="Lọc theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCompareMode && (
              <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border">
                {/* Period 1 Picker */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">Kỳ 1</span>
                  {filter === "year" ? (
                    <Select value={period1} onValueChange={(value) => setPeriod1(value)}>
                      <SelectTrigger className="h-7 text-xs w-[100px]">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : filter === "month" ? (
                    <div className="flex gap-1">
                      <Select 
                        value={period1.split("-")[1]} 
                        onValueChange={(m) => setPeriod1(`${period1.split("-")[0]}-${m}`)}
                      >
                        <SelectTrigger className="h-7 text-xs w-[90px]">
                          <SelectValue placeholder="Tháng" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map(m => (
                            <SelectItem key={m} value={m}>{`Tháng ${parseInt(m)}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={period1.split("-")[0]} 
                        onValueChange={(y) => setPeriod1(`${y}-${period1.split("-")[1]}`)}
                      >
                        <SelectTrigger className="h-7 text-xs w-[80px]">
                          <SelectValue placeholder="Năm" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Input
                      type="date"
                      value={period1}
                      onChange={(e) => setPeriod1(e.target.value)}
                      className="h-7 text-xs w-[140px]"
                    />
                  )}
                </div>

                <ArrowRightLeft className="h-4 w-4 text-muted-foreground self-end mb-1.5 mx-1" />

                {/* Period 2 Picker */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-orange-500 uppercase">Kỳ 2</span>
                  {filter === "year" ? (
                    <Select value={period2} onValueChange={(value) => setPeriod2(value)}>
                      <SelectTrigger className="h-7 text-xs w-[100px]">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : filter === "month" ? (
                    <div className="flex gap-1">
                      <Select 
                        value={period2.split("-")[1]} 
                        onValueChange={(m) => setPeriod2(`${period2.split("-")[0]}-${m}`)}
                      >
                        <SelectTrigger className="h-7 text-xs w-[90px]">
                          <SelectValue placeholder="Tháng" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map(m => (
                            <SelectItem key={m} value={m}>{`Tháng ${parseInt(m)}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={period2.split("-")[0]} 
                        onValueChange={(y) => setPeriod2(`${y}-${period2.split("-")[1]}`)}
                      >
                        <SelectTrigger className="h-7 text-xs w-[80px]">
                          <SelectValue placeholder="Năm" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Input
                      type="date"
                      value={period2}
                      onChange={(e) => setPeriod2(e.target.value)}
                      className="h-7 text-xs w-[140px]"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {isCompareMode ? (
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey={comparisonData?.period1?.label} fill="#3b82f6" radius={[4, 4, 0, 0]} name={`Kỳ 1 (${comparisonData?.period1?.label})`} />
                  <Bar dataKey={comparisonData?.period2?.label} fill="#f97316" radius={[4, 4, 0, 0]} name={`Kỳ 2 (${comparisonData?.period2?.label})`} />
                </BarChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Doanh thu") return [`$${value.toFixed(2)}`, name];
                      return [value, "Đơn hàng"];
                    }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    name="Doanh thu"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="orders"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                    name="Đơn hàng"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isCustomStyling={true}
          />
          <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
            Upload Banner
          </Button>
          <div className="flex flex-col gap-4 mt-5">
            {featureImageList && featureImageList.length > 0
              ? featureImageList.map((featureImgItem) => (
                <div key={featureImgItem._id} className="relative group">
                  <img
                    src={featureImgItem.image}
                    className="w-full h-[200px] object-cover rounded-lg"
                  />
                  <Button
                    onClick={() =>
                      handleDeleteFeatureImage(featureImgItem._id)
                    }
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </Button>
                </div>
              ))
              : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
