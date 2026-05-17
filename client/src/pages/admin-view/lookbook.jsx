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
  editLookbook,
} from "@/store/admin/lookbook-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { Search, Trash2, ChevronDown, GripHorizontal, Edit, RotateCcw, Plus } from "lucide-react";
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

function SortableLookbookItem({ lookbook, index, handleDeleteLookbook, handleEditClick }) {
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
      className={`group relative rounded-xl border bg-white p-3 transition-transform duration-200 ${isDragging ? "shadow-lg border-sky-400" : ""
        }`}
    >
      <div className="relative">
        <img
          src={lookbook.imageUrl}
          alt="Lookbook"
          className="h-56 w-full object-cover rounded-lg"
        />

        {/* Order number */}
        <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white shadow-sm pointer-events-none">
          {index + 1}
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleEditClick(lookbook)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white cursor-grab active:cursor-grabbing backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              {...attributes}
              {...listeners}
            >
              <GripHorizontal className="h-4 w-4" />
            </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-gray-100 px-2 py-1 rounded">
          {lookbook.products?.length || 0} Products
        </p>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8 rounded-full"
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
  
  const [editingId, setEditingId] = useState(null);

  const [localLookbooks, setLocalLookbooks] = useState([]);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchAllLookbooksAdmin());
  }, [dispatch]);

  useEffect(() => {
    setLocalLookbooks(lookbookList || []);
  }, [lookbookList]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  const handleCreateOrUpdate = () => {
    if (!uploadedImageUrl || selectedProductIds.length === 0) {
      toast({
        title: "Vui lòng upload ảnh và chọn ít nhất 1 sản phẩm",
        variant: "destructive",
      });
      return;
    }

    const payload = {
        imageUrl: uploadedImageUrl,
        products: selectedProductIds,
    };

    const action = editingId 
        ? editLookbook({ id: editingId, payload }) 
        : addNewLookbook(payload);

    dispatch(action).then((data) => {
      if (data?.payload?.success) {
        toast({ title: editingId ? "Đã cập nhật Lookbook!" : "Tạo Lookbook mới thành công!" });
        resetForm();
        dispatch(fetchAllLookbooksAdmin());
      }
    });
  };

  const resetForm = () => {
    setImageFile(null);
    setUploadedImageUrl("");
    setSelectedProductIds([]);
    setProductSearch("");
    setOpenProductDropdown(false);
    setEditingId(null);
  };

  const handleEditClick = (look) => {
    setEditingId(look._id);
    setUploadedImageUrl(look.imageUrl);
    setSelectedProductIds((look.products || []).map(p => p._id || p));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteLookbook = (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá Lookbook này không?")) return;
    dispatch(deleteLookbook(id)).then(() => dispatch(fetchAllLookbooksAdmin()));
  };

  return (
    <div className="flex flex-col gap-10 p-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plus className="text-sky-500 h-6 w-6" />
            {editingId ? "Chỉnh sửa Lookbook" : "Quản lý Lookbooks"}
          </h1>
          <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mt-1">
             Tạo bộ sưu tập sản phẩm và sắp xếp thứ tự hiển thị
          </p>
        </div>
        {editingId && (
            <Button variant="outline" size="sm" onClick={resetForm} className="gap-2 rounded-full border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm">
                <RotateCcw className="h-3.5 w-3.5" /> Hủy chỉnh sửa
            </Button>
        )}
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        
        <div className="grid gap-6 lg:grid-cols-2 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 items-start">
          <div>
            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              imageLoadingState={imageLoadingState}
              setImageLoadingState={setImageLoadingState}
              isEditMode={!!editingId}
              isMulti={false}
            />
          </div>

          <div className="relative flex flex-col gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Sản phẩm liên kết</label>
              <button
                type="button"
                onClick={() => setOpenProductDropdown((prev) => !prev)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium hover:bg-gray-50 transition-all focus:ring-2 focus:ring-sky-500"
              >
                <span className="text-gray-600">
                  {selectedProductIds.length > 0
                    ? `Đã chọn ${selectedProductIds.length} sản phẩm`
                    : "Chọn sản phẩm..."}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${openProductDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {openProductDropdown && (
              <div className="absolute top-[80px] z-20 w-full rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm tên sản phẩm..."
                    className="pl-9 h-11 border-gray-100 bg-gray-50 focus-visible:ring-sky-500 rounded-xl"
                  />
                </div>
                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                  {filteredProducts.map((product) => (
                    <label
                      key={product._id}
                      className={`flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2 transition-colors ${selectedProductIds.includes(product._id) ? 'bg-sky-50 border-sky-100' : 'hover:bg-gray-50 border-transparent'} border`}
                    >
                      <Checkbox
                        checked={selectedProductIds.includes(product._id)}
                        onCheckedChange={() => handleToggleProduct(product._id)}
                      />
                      <div className="flex items-center gap-3 w-full">
                        <img src={product.image} className="w-9 h-11 object-cover rounded-lg shadow-sm" alt="" />
                        <span className="text-xs font-bold text-gray-700 uppercase">{product.title}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedProductIds.length > 0 && (
              <div className="mt-2 border-t border-gray-100 pt-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Đã chọn ({selectedProductIds.length})</p>
                <div className="max-h-[120px] overflow-y-auto flex flex-wrap gap-1.5 p-1 pr-2">
                  {selectedProductIds.map((id) => {
                    const product = (productList || []).find((item) => item._id === id);
                    if (!product) return null;
                    return (
                      <span
                        key={id}
                        className="rounded-lg bg-slate-900/5 text-slate-700 border border-slate-200 px-2 py-1 text-[9px] font-bold uppercase tracking-tight flex items-center gap-1.5 shadow-sm"
                      >
                        <div className="w-1 h-1 rounded-full bg-sky-500"></div>
                        <span className="truncate max-w-[120px]">{product.title}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              <Button
                className="w-full h-12 text-xs font-black uppercase tracking-[0.2em] bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/20"
                onClick={handleCreateOrUpdate}
                disabled={isLoading || imageLoadingState}
              >
                {editingId ? "Cập nhật Lookbook" : "Lưu Lookbook"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-end justify-between px-2">
             <div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Bộ sưu tập Lookbook ({localLookbooks.length})</h3>
                <div className="h-1 w-10 bg-sky-500 rounded-full mt-1"></div>
             </div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kéo thả để sắp xếp vị trí</p>
        </div>

        {localLookbooks.length === 0 ? (
          <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed text-gray-400">
            <p className="text-sm font-medium">Chưa có lookbook nào.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <SortableContext items={localLookbooks.map((l) => l._id)} strategy={rectSortingStrategy}>
                {localLookbooks.map((lookbook, index) => (
                  <SortableLookbookItem
                    key={lookbook._id}
                    lookbook={lookbook}
                    index={index}
                    handleDeleteLookbook={handleDeleteLookbook}
                    handleEditClick={handleEditClick}
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
