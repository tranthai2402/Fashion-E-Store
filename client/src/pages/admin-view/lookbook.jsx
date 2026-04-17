import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  addNewLookbook,
  deleteLookbook,
  fetchAllLookbooksAdmin,
  reorderLookbooks,
} from "@/store/admin/lookbook-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { Search, Trash2, ChevronDown, GripHorizontal } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableLookbookItem({ lookbook, index, handleDeleteLookbook }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lookbook._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-md border bg-white p-3 transition-transform duration-200 ${
        isDragging ? "shadow-lg border-sky-400" : ""
      }`}
    >
      <div className="relative">
        <img
          src={lookbook.imageUrl}
          alt="Lookbook"
          className="h-56 w-full object-cover rounded-sm"
        />
        
        {/* Order number */}
        <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white shadow-sm pointer-events-none">
          {index + 1}
        </div>
        
        {/* Drag handle */}
        <div
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white cursor-grab active:cursor-grabbing backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground bg-gray-100 px-2 py-1 rounded-md">
          {lookbook.products?.length || 0} Products Linked
        </p>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => handleDeleteLookbook(lookbook._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AdminLookbook() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.adminProducts);
  const { lookbookList, isLoading } = useSelector((state) => state.adminLookbook);

  const [imageFile, setImageFile] = useState(null);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [openProductDropdown, setOpenProductDropdown] = useState(false);

  const [localLookbooks, setLocalLookbooks] = useState([]);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchAllLookbooksAdmin());
  }, [dispatch]);

  useEffect(() => {
    setLocalLookbooks(lookbookList || []);
  }, [lookbookList]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        setLocalLookbooks((items) => {
          const oldIndex = items.findIndex((item) => item._id === active.id);
          const newIndex = items.findIndex((item) => item._id === over.id);

          const newArr = arrayMove(items, oldIndex, newIndex);
          const payload = newArr.map((look, index) => ({
            id: look._id,
            order: index,
          }));

          dispatch(reorderLookbooks(payload));

          return newArr;
        });
      }
    },
    [dispatch]
  );

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return productList || [];
    return (productList || []).filter((product) =>
      String(product.title || "").toLowerCase().includes(query)
    );
  }, [productList, productSearch]);

  const handleToggleProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateLookbook = () => {
    if (!uploadedImageUrl || selectedProductIds.length === 0) {
      toast({
        title: "Vui lòng upload ảnh và chọn ít nhất 1 sản phẩm",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addNewLookbook({
        imageUrl: uploadedImageUrl,
        products: selectedProductIds,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Tạo Lookbook mới thành công!" });
        setImageFile(null);
        setUploadedImageUrl("");
        setSelectedProductIds([]);
        setProductSearch("");
        setOpenProductDropdown(false);
        dispatch(fetchAllLookbooksAdmin());
      } else {
        toast({
          title: data?.payload?.message || "Lỗi tạo Lookbook",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteLookbook = (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá Lookbook này không?")) return;
    dispatch(deleteLookbook(id)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Đã xoá Lookbook" });
        dispatch(fetchAllLookbooksAdmin());
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="rounded-lg border bg-background p-6">
        <h2 className="text-lg font-semibold">Tạo Lookbook Mới</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload ảnh người mẫu và liên kết với các sản phẩm tương ứng.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              imageLoadingState={imageLoadingState}
              setImageLoadingState={setImageLoadingState}
              isEditMode={false}
              isMulti={false}
            />
          </div>

          <div className="relative flex flex-col gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Các sản phẩm trong hình</label>
              <button
                type="button"
                onClick={() => setOpenProductDropdown((prev) => !prev)}
                className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium hover:bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
              >
                <span>
                  {selectedProductIds.length > 0
                    ? `Đã chọn ${selectedProductIds.length} sản phẩm`
                    : "Chọn sản phẩm..."}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {openProductDropdown && (
              <div className="absolute top-[76px] z-20 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm tên sản phẩm..."
                    className="pl-9 h-10 border-gray-200 bg-gray-50 focus-visible:ring-sky-500"
                  />
                </div>
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                  {filteredProducts.map((product) => (
                    <label
                      key={product._id}
                      className="flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-colors"
                    >
                      <Checkbox
                        checked={selectedProductIds.includes(product._id)}
                        onCheckedChange={() => handleToggleProduct(product._id)}
                      />
                      <div className="flex items-center gap-3 w-full">
                        <img src={product.image} className="w-8 h-10 object-cover rounded shadow-sm" alt=""/>
                        <span className="text-sm font-medium text-gray-700">{product.title}</span>
                      </div>
                    </label>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Không tìm thấy sản phẩm nào</p>
                  )}
                </div>
              </div>
            )}

            {selectedProductIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 mt-2">
                {selectedProductIds.map((id) => {
                  const product = (productList || []).find((item) => item._id === id);
                  if (!product) return null;
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-medium flex items-center gap-1 shadow-sm"
                    >
                      {product.title}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-auto pt-4">
              <Button
                className="w-full h-11 text-sm font-bold bg-sky-600 hover:bg-sky-700"
                onClick={handleCreateLookbook}
                disabled={isLoading || imageLoadingState}
              >
                Lưu Lookbook
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Danh Sách Lookbooks</h3>
          <p className="text-xs text-muted-foreground">Kéo thả để sắp xếp vị trí hiển thị</p>
        </div>
        
        {localLookbooks.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-4 text-center py-10 bg-gray-50 rounded-lg border border-dashed">
            Chưa có lookbook nào.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SortableContext items={localLookbooks.map((l) => l._id)} strategy={rectSortingStrategy}>
                {localLookbooks.map((lookbook, index) => (
                  <SortableLookbookItem
                    key={lookbook._id}
                    lookbook={lookbook}
                    index={index}
                    handleDeleteLookbook={handleDeleteLookbook}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </div>
    </div>
  );
}

export default AdminLookbook;
