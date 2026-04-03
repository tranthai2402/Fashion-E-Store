import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const initialFormData = {
  image: null,
  images: [],
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  sizes: [],
  colors: [],
  colorImageMap: [],
  averageReview: 0,
  variants: [],
};

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const lastPage = totalPages;
  const lastTwo = [lastPage - 1, lastPage];

  if (currentPage <= 2) {
    return [1, 2, 3, "ellipsis", ...lastTwo];
  }

  if (currentPage === 3) {
    return [1, 2, 3, 4, "ellipsis", ...lastTwo];
  }

  if (currentPage >= 4 && currentPage <= lastPage - 3) {
    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      ...lastTwo,
    ];
  }

  return [1, "ellipsis", lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
}

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const formControls = hasVariants ? addProductFormElements.filter(control => control.name !== 'totalStock') : addProductFormElements;

  const filteredProducts =
    productList && productList.length > 0
      ? productList.filter((productItem) => {
        const matchesSearch = productItem.title && productItem.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStock = showOutOfStockOnly
          ? (productItem.variants && productItem.variants.length > 0
              ? productItem.variants.some(variant => variant.stock <= 0)
              : productItem.totalStock <= 0)
          : true;

        return matchesSearch && matchesStock;
      })
      : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showOutOfStockOnly, productList]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const pageButtons = getPaginationItems(safeCurrentPage, totalPages);

  function onSubmit(event) {
    event.preventDefault();

    const finalFormData = {
      ...formData,
      title: formData.title ? formData.title.toUpperCase() : "",
      description: formData.description ? formData.description.toUpperCase() : "",
      colorImageMap: Array.isArray(formData.colorImageMap)
        ? formData.colorImageMap
        : [],
      images: uploadedImageUrl,
      image: uploadedImageUrl.length > 0 ? uploadedImageUrl[0] : "",
      totalStock: formData.variants.length > 0 
        ? formData.variants.reduce((sum, v) => sum + Number(v.stock), 0)
        : formData.totalStock
    };

    currentEditedId !== null
      ? dispatch(
        editProduct({
          id: currentEditedId,
          formData: finalFormData,
        })
      ).then((data) => {
        console.log(data, "edit");

        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setFormData(initialFormData);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setHasVariants(false);
        }
      })
      : dispatch(
        addNewProduct(finalFormData)
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          setImageFile(null);
          setFormData(initialFormData);
          toast({
            title: "Product add successfully",
          });
        }
      });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function isFormValid() {
    const isSalePriceValid =
      formData.salePrice === "" ||
      formData.salePrice === 0 ||
      Number(formData.salePrice) < Number(formData.price);

    return (
      Object.keys(formData)
        .filter(
          (currentKey) =>
            currentKey !== "averageReview" &&
            currentKey !== "salePrice" &&
            currentKey !== "description" &&
            currentKey !== "image" &&
            currentKey !== "images" &&
            currentKey !== "colorImageMap" &&
            !currentKey.endsWith("_input")
        )
        .map((key) => {
          const value = formData[key];
          if (Array.isArray(value)) return value.length > 0;
          return value !== "" && value !== null && value !== undefined;
        })
        .every((item) => item) &&
      formData.totalStock >= 0 &&
      isSalePriceValid &&
      uploadedImageUrl.length > 0
    );
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Auto-generate variants from sizes and colors
  useEffect(() => {
    if (formData.sizes.length > 0 && formData.colors.length > 0) {
      const generatedVariants = [];
      for (const size of formData.sizes) {
        for (const color of formData.colors) {
          // Check if variant already exists to preserve stock
          const existingVariant = formData.variants.find(v => v.size === size && v.color === color);
          generatedVariants.push({
            size,
            color,
            stock: existingVariant ? existingVariant.stock : 1,
            price: formData.price || 0,
            salePrice: formData.salePrice || 0,
          });
        }
      }
      setFormData(prev => ({
        ...prev,
        variants: generatedVariants,
      }));
      setHasVariants(true);
    } else if (formData.sizes.length === 0 || formData.colors.length === 0) {
      setFormData(prev => ({
        ...prev,
        variants: [],
      }));
      setHasVariants(false);
    }
  }, [formData.sizes, formData.colors, formData.price, formData.salePrice]);

  // Update totalStock when variants change
  useEffect(() => {
    if (formData.variants.length > 0) {
      const total = formData.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
      setFormData(prev => ({ ...prev, totalStock: total }));
    }
  }, [formData.variants]);

  // Keep color -> image mapping in sync with selected colors and uploaded images
  useEffect(() => {
    const colors = Array.isArray(formData.colors) ? formData.colors : [];
    const images = Array.isArray(uploadedImageUrl) ? uploadedImageUrl : [];

    if (colors.length === 0 || images.length === 0) {
      if ((formData.colorImageMap || []).length > 0) {
        setFormData((prev) => ({ ...prev, colorImageMap: [] }));
      }
      return;
    }

    const existingMap = Object.fromEntries(
      (formData.colorImageMap || []).map((item) => [
        String(item.color || "").trim().toLowerCase(),
        item.imageUrl,
      ])
    );

    const nextMap = colors.map((color, index) => {
      const normalizedColor = String(color || "").trim().toLowerCase();
      const existingImage = existingMap[normalizedColor];
      return {
        color,
        imageUrl:
          existingImage && images.includes(existingImage)
            ? existingImage
            : images[index] || images[0],
      };
    });

    const currentSerialized = JSON.stringify(formData.colorImageMap || []);
    const nextSerialized = JSON.stringify(nextMap);

    if (currentSerialized !== nextSerialized) {
      setFormData((prev) => ({ ...prev, colorImageMap: nextMap }));
    }
  }, [formData.colors, formData.colorImageMap, uploadedImageUrl]);

  // Reset images when opening dialog for add new
  useEffect(() => {
    if (openCreateProductsDialog && currentEditedId === null) {
      setUploadedImageUrl([]);
      setImageFile(null);
    }
  }, [openCreateProductsDialog, currentEditedId]);

  // Sync images and variants when editing
  useEffect(() => {
    if (currentEditedId !== null && openCreateProductsDialog) {
      const existingImages =
        formData.images && formData.images.length > 0
          ? formData.images
          : (formData.image ? [formData.image] : []);

      setUploadedImageUrl(existingImages);
      setImageFile(existingImages);

      if (formData.variants.length > 0) {
        setHasVariants(true);
      }
    }
  }, [currentEditedId, formData, openCreateProductsDialog]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="pl-8 bg-background"
            />
          </div>
          <div className="flex items-center space-x-2 border p-2 rounded-md bg-background min-w-fit">
            <Checkbox
              id="outOfStock"
              checked={showOutOfStockOnly}
              onCheckedChange={(checked) => setShowOutOfStockOnly(checked)}
            />
            <Label
              htmlFor="outOfStock"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Out of stock
            </Label>
          </div>
        </div>
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="rounded-lg border bg-background min-h-[520px] flex flex-col">
        <div className="hidden md:grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_140px] gap-4 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground border-b items-center">
          <div>Image</div>
          <div>Product Info</div>
          <div>Stock</div>
          <div>Price</div>
          <div>Sale</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y flex-1">
          {paginatedProducts && paginatedProducts.length > 0
            ? paginatedProducts.map((productItem) => (
                <AdminProductTile
                  key={productItem?._id}
                  setFormData={setFormData}
                  setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                  setCurrentEditedId={setCurrentEditedId}
                  product={productItem}
                  handleDelete={handleDelete}
                />
              ))
            : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Showing {filteredProducts.length === 0 ? 0 : startIndex + 1}
          {" - "}
          {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
          {filteredProducts.length}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          {pageButtons.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === safeCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
          >
            Next
          </Button>
        </div>
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            setFormData(initialFormData);
            setUploadedImageUrl([]);
            setImageFile(null);
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
            isMulti={true}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={formControls}
              isBtnDisabled={!isFormValid()}
              errors={
                formData.salePrice !== "" &&
                  formData.salePrice > 0 &&
                  Number(formData.salePrice) >= Number(formData.price)
                  ? { salePrice: "Giá sale phải nhỏ hơn giá gốc!" }
                  : {}
              }
            />

            {formData.colors.length > 0 && uploadedImageUrl.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">
                  Color Image Mapping
                </Label>
                <p className="text-xs text-muted-foreground mb-4">
                  Choose which image should represent each color.
                </p>
                <div className="space-y-3">
                  {formData.colors.map((color, idx) => {
                    const currentMapping =
                      formData.colorImageMap?.find(
                        (item) =>
                          String(item.color || "").toLowerCase() ===
                          String(color || "").toLowerCase()
                      ) || {};

                    return (
                      <div
                        key={`${color}-${idx}`}
                        className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: String(color).toLowerCase() }}
                          />
                          <span className="text-sm font-medium uppercase tracking-wide">
                            {color}
                          </span>
                        </div>
                        <select
                          value={currentMapping.imageUrl || ""}
                          onChange={(e) => {
                            const imageUrl = e.target.value;
                            setFormData((prev) => {
                              const nextMap = [...(prev.colorImageMap || [])];
                              const itemIndex = nextMap.findIndex(
                                (item) =>
                                  String(item.color || "").toLowerCase() ===
                                  String(color || "").toLowerCase()
                              );
                              const payload = { color, imageUrl };
                              if (itemIndex > -1) nextMap[itemIndex] = payload;
                              else nextMap.push(payload);
                              return { ...prev, colorImageMap: nextMap };
                            });
                          }}
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          {uploadedImageUrl.map((imageUrl, imageIdx) => (
                            <option key={imageUrl} value={imageUrl}>
                              Image {imageIdx + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.variants.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">
                  Variants
                </Label>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Variant</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 w-24">Price</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 w-24">Sale</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 w-20">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.variants.map((variant, vIdx) => (
                        <tr key={vIdx} className={variant.stock == 0 ? "opacity-50 line-through" : ""}>
                          <td className="px-3 py-2 font-medium">
                            {variant.size} {variant.color ? `/ ${variant.color}` : ""}
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              type="number" 
                              className="h-8 p-1" 
                              value={variant.price}
                              min="0"
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[vIdx].price = e.target.value;
                                setFormData({ ...formData, variants: newVariants });
                              }}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              type="number" 
                              className="h-8 p-1" 
                              value={variant.salePrice}
                              min="0"
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[vIdx].salePrice = e.target.value;
                                setFormData({ ...formData, variants: newVariants });
                              }}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input 
                              type="number" 
                              className="h-8 p-1" 
                              value={variant.stock}
                              min="0"
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[vIdx].stock = e.target.value;
                                setFormData({ ...formData, variants: newVariants });
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
