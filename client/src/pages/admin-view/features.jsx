import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFeatureImages,
  addFeatureImage,
  deleteFeatureImage,
  updateFeatureImageStatus,
  reorderFeatureImages,
  updateFeatureImage
} from "@/store/common-slice";
import { fetchAllLookbooksAdmin } from "@/store/admin/lookbook-slice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ImagePlay,
  Trash2,
  Eye,
  EyeOff,
  UploadCloud,
  Loader2,
  Images,
  GripHorizontal,
  Link2,
} from "lucide-react";
import axios from "axios";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

function SortableFeatureItem({ item, index, handleToggleStatus, handleDelete, lookbooks, handleUpdateLookbook, handleUpdateImage }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

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
      className={`group relative rounded-xl border-2 transition-transform duration-200 ${
        item.enabled !== false
          ? "border-sky-300 shadow-md"
          : "border-gray-200 opacity-60"
      }`}
    >
      <div className="aspect-[3/4] w-full overflow-hidden rounded-t-[10px] bg-gray-100 relative">
        <img
          src={item.image}
          alt={`Feature ${index + 1}`}
          className={`h-full w-full object-cover ${
            item.enabled === false ? "opacity-30 grayscale blur-[1px]" : "opacity-100"
          }`}
        />

        {item.enabled === false && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg border border-white/20">
              Đã ẩn
            </span>
          </div>
        )}
      </div>

      {/* Lookbook Link Selector */}
      <div 
        className="absolute top-12 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Select
          value={item.lookbookId || "none"}
          onValueChange={(val) => handleUpdateLookbook(item._id, val === "none" ? null : val)}
        >
          <SelectTrigger className="h-8 bg-white/90 backdrop-blur-sm text-[10px] font-bold border-none shadow-lg">
            <div className="flex items-center gap-1.5 truncate">
               <Link2 className="h-3 w-3 text-sky-500" />
               <SelectValue placeholder="Gắn Lookbook..." />
            </div>
          </SelectTrigger>
          <SelectContent className="z-[100]">
            <SelectItem value="none" className="text-[10px]">Không gắn link</SelectItem>
            {lookbooks?.map((look, i) => (
              <SelectItem key={look._id} value={look._id} className="text-[10px]">
                Lookbook #{i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="absolute top-2 left-2">
        <Badge
          className={`text-[10px] px-2 py-0.5 font-medium ${
            item.enabled !== false ? "bg-sky-500 text-white" : "bg-gray-400 text-white"
          }`}
        >
          {item.enabled !== false ? "Đang hiện" : "Đang ẩn"}
        </Badge>
      </div>

      <div
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white cursor-grab active:cursor-grabbing backdrop-blur-sm"
        {...attributes}
        {...listeners}
      >
        <GripHorizontal className="h-4 w-4" />
      </div>

      <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-sm bg-black/50 text-[10px] font-bold text-white pointer-events-none z-10">
        {index + 1}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1 gap-1 text-[10px] h-8 px-2"
          onClick={() => handleToggleStatus(item)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {item.enabled !== false ? (
            <>
              <EyeOff className="h-3 w-3" /> Ẩn
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" /> Hiện
            </>
          )}
        </Button>
        <div className="relative flex-1 group/edit">
            <Button
              size="sm"
              variant="secondary"
              className="w-full gap-1 text-[10px] h-8 px-2 hover:bg-sky-500 hover:text-white transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                const input = document.getElementById(`edit-image-${item._id}`);
                if (input) input.click();
              }}
            >
              <Images className="h-3 w-3" /> Sửa ảnh
            </Button>
            <input 
              type="file"
              id={`edit-image-${item._id}`}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpdateImage(item, file);
              }}
            />
        </div>
        <Button
          size="sm"
          variant="destructive"
          className="gap-1 text-xs h-8 px-2"
          onClick={() => handleDelete(item._id)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function AdminFeatures() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { featureImageList, isLoading } = useSelector(
    (state) => state.commonFeature
  );
  const { lookbookList } = useSelector((state) => state.adminLookbook);

  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    dispatch(getFeatureImages());
    dispatch(fetchAllLookbooksAdmin());
  }, [dispatch]);

  useEffect(() => {
    setLocalItems(featureImageList || []);
  }, [featureImageList]);

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

  const uploadAndSave = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: "Vui lòng chọn ảnh nhỏ hơn 5MB.",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("my_file", file);
      const res = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        formData
      );
      if (res?.data?.success) {
        const imageUrl = res.data.result.url;
        const result = await dispatch(addFeatureImage({ image: imageUrl, lookbookId: null }));
        if (result?.payload?.success) {
          toast({ title: "Đã thêm ảnh thành công!" });
          dispatch(getFeatureImages());
        }
      }
    } catch (err) {
      toast({
        title: "Lỗi upload",
        description: "Không thể upload ảnh. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadAndSave(file);
  };

  const handleDropUpload = (e) => {
    e.preventDefault();
    setIsDraggingUpload(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAndSave(file);
  };

  const handleToggleStatus = (item) => {
    dispatch(
      updateFeatureImageStatus({ id: item._id, enabled: !item.enabled })
    ).then((res) => {
      if (res?.payload?.success) {
        toast({
          title: item.enabled
            ? "Ảnh đã được ẩn"
            : "Ảnh đang được hiển thị",
        });
        dispatch(getFeatureImages());
      }
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này không?")) return;
    dispatch(deleteFeatureImage(id)).then((res) => {
      if (res?.payload?.success) {
        toast({ title: "Đã xóa ảnh" });
        dispatch(getFeatureImages());
      }
    });
  };

  const handleUpdateImage = async (item, file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("my_file", file);
      const res = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        formData
      );
      if (res?.data?.success) {
        const imageUrl = res.data.result.url;
        dispatch(
          updateFeatureImage({ 
            id: item._id, 
            image: imageUrl, 
            enabled: item.enabled, 
            lookbookId: item.lookbookId 
          })
        ).then((res) => {
          if (res?.payload?.success) {
            toast({ title: "Đã cập nhật ảnh thành công" });
            dispatch(getFeatureImages());
          }
        });
      }
    } catch (err) {
      toast({
        title: "Lỗi upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateLookbook = (id, lookbookId) => {
    const item = localItems.find(i => i._id === id);
    if (!item) return;

    dispatch(
      updateFeatureImage({ 
        id, 
        image: item.image, 
        enabled: item.enabled, 
        lookbookId 
      })
    ).then((res) => {
      if (res?.payload?.success) {
        toast({ title: "Đã cập nhật link Lookbook" });
        dispatch(getFeatureImages());
      }
    });
  };

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        setLocalItems((items) => {
          const oldIndex = items.findIndex((item) => item._id === active.id);
          const newIndex = items.findIndex((item) => item._id === over.id);

          const newArr = arrayMove(items, oldIndex, newIndex);
          const payload = newArr.map((img, index) => ({
            id: img._id,
            order: index,
          }));

          dispatch(reorderFeatureImages(payload));

          return newArr;
        });
      }
    },
    [dispatch]
  );

  const enabledCount = localItems.filter((i) => i.enabled !== false).length;

  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImagePlay className="text-sky-500 h-6 w-6" />
            Quản lý Hero Banners
          </h1>
          <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mt-1">
            Thiết kế banner và liên kết bộ sưu tập Lookbook
          </p>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight mt-1">
            Đang hiển thị: <span className="font-bold text-sky-600">{enabledCount}</span> / {localItems.length} ảnh
          </p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingUpload(true);
        }}
        onDragLeave={() => setIsDraggingUpload(false)}
        onDrop={handleDropUpload}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 ${
          isDraggingUpload
            ? "border-sky-400 bg-sky-50 scale-[1.01]"
            : "border-gray-300 bg-gray-50 hover:border-sky-400 hover:bg-sky-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
            <p className="text-sm text-sky-600 font-medium">Đang upload...</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">
              Kéo thả ảnh hoặc <span className="text-sky-500 underline">bấm để chọn</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG — dưới 5MB</p>
          </>
        )}
      </div>

      {isLoading && !localItems.length ? (
        <div className="flex justify-center h-48 items-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        </div>
      ) : localItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-dashed py-20 text-gray-400 bg-gray-50 rounded-2xl">
          <Images className="h-12 w-12" />
          <p className="text-sm">Chưa có ảnh nào. Rất trống trải!</p>
        </div>
      ) : (
        <div className="space-y-6">
        <div className="flex items-end justify-between px-2">
             <div>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Danh sách Banners ({localItems.length})</h3>
                <div className="h-1 w-10 bg-sky-500 rounded-full mt-1"></div>
             </div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kéo thả để sắp xếp vị trí</p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <SortableContext items={localItems.map((i) => i._id)} strategy={rectSortingStrategy}>
              {localItems.map((item, index) => (
                <SortableFeatureItem
                  key={item._id}
                  item={item}
                  index={index}
                  handleToggleStatus={handleToggleStatus}
                  handleDelete={handleDelete}
                  lookbooks={lookbookList}
                  handleUpdateLookbook={handleUpdateLookbook}
                  handleUpdateImage={handleUpdateImage}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
        </div>
      )}

      <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-800">
        <p className="font-semibold mb-1">💡 Hướng dẫn</p>
        <ul className="list-disc list-inside space-y-1 text-sky-700 text-xs">
          <li><strong>Kéo thả</strong> ảnh bằng biểu tượng góc trên phải để đổi vị trí. Vị trí này sẽ hiển thị cho khách đúng như vậy.</li>
          <li>Ảnh bị "Ẩn" sẽ được bỏ qua trên băng chuyền Trang chủ.</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminFeatures;
