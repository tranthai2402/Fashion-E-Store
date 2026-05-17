import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "../ui/use-toast";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
  isMulti = false,
}) {
  const inputRef = useRef(null);
  const { toast } = useToast();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  function handleImageFileChange(event) {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const validFiles = Array.from(selectedFiles).filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File quá lớn",
            description: `Ảnh ${file.name} có kích thước lớn hơn 5MB. Vui lòng chọn ảnh khác.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      if (isMulti) {
        setImageFile((prevFiles) => {
          const currentFiles = Array.isArray(prevFiles)
            ? prevFiles
            : prevFiles
            ? [prevFiles]
            : [];
          return [...currentFiles, ...validFiles];
        });
      } else {
        setImageFile(validFiles[0]);
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const validFiles = Array.from(droppedFiles).filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File quá lớn",
            description: `Ảnh ${file.name} có kích thước lớn hơn 5MB. Vui lòng chọn ảnh khác.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      if (isMulti) {
        setImageFile((prevFiles) => {
          const currentFiles = Array.isArray(prevFiles)
            ? prevFiles
            : prevFiles
            ? [prevFiles]
            : [];
          return [...currentFiles, ...validFiles];
        });
      } else {
        setImageFile(validFiles[0]);
      }
    }
  }

  function handleRemoveImage(index) {
    if (isMulti) {
      const updatedFiles = Array.isArray(imageFile) ? imageFile.filter((_, i) => i !== index) : null;
      setImageFile(updatedFiles && updatedFiles.length > 0 ? updatedFiles : null);

      const updatedUrls = Array.isArray(uploadedImageUrl) ? uploadedImageUrl.filter((_, i) => i !== index) : [];
      setUploadedImageUrl(updatedUrls);
    } else {
      setImageFile(null);
      setUploadedImageUrl("");
    }

    if (!isMulti && inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    setImageLoadingState(true);

    const uploadSingle = async (file) => {
      const data = new FormData();
      data.append("my_file", file);
      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data
      );
      return response?.data?.success ? response.data.result.url : null;
    };

    if (isMulti) {
      const filesToUpload = Array.isArray(imageFile) ? imageFile : [imageFile];
      // Only upload files that don't have a URL yet (if we ever support incremental)
      // For now, we upload what's in imageFile that isn't already in uploadedImageUrl by mapping
      // But simpler: just upload all current imageFile items that are actual File objects
      const uploadPromises = filesToUpload.map(file => 
        file instanceof File ? uploadSingle(file) : Promise.resolve(file)
      );

      const results = await Promise.all(uploadPromises);
      const validResults = results.filter(url => url !== null);
      setUploadedImageUrl(validResults);
    } else {
      const url = await uploadSingle(imageFile);
      if (url) setUploadedImageUrl(url);
    }

    setImageLoadingState(false);
  }

  useEffect(() => {
    if (imageFile !== null) {
      // For multi-upload, we only trigger if there are new File objects
      const hasNewFiles = isMulti 
        ? (Array.isArray(imageFile) && imageFile.some(f => f instanceof File))
        : (imageFile instanceof File);
      
      if (hasNewFiles) uploadImageToCloudinary();
    }
  }, [imageFile]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">
        {isMulti ? "Upload Images" : "Upload Image"}
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${isEditMode ? "opacity-60" : ""} border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          multiple={isMulti}
        />
        {!imageFile || (isMulti && Array.isArray(imageFile) && imageFile.length === 0) ? (
          <Label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center h-32 cursor-pointer"
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to upload {isMulti ? "images" : "image"}</span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : isMulti ? (
          <div className="grid grid-cols-3 gap-2">
            {(Array.isArray(uploadedImageUrl) ? uploadedImageUrl : []).map((url, index) => (
              <div key={index} className="relative group aspect-square border rounded-md overflow-hidden bg-muted">
                <img src={url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-muted transition-colors"
            >
              <UploadCloudIcon className="h-6 w-6 text-muted-foreground" />
            </Label>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="w-8 text-primary mr-2 h-8" />
              <p className="text-sm font-medium">{imageFile.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => handleRemoveImage()}
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Remove File</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
