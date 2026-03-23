import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  addNewLookbook,
  deleteLookbook,
  fetchAllLookbooksAdmin,
} from "@/store/admin/lookbook-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { Search, Trash2, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchAllLookbooksAdmin());
  }, [dispatch]);

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
        title: "Please upload image and select at least one product",
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
        toast({ title: "Lookbook created successfully" });
        setImageFile(null);
        setUploadedImageUrl("");
        setSelectedProductIds([]);
        setProductSearch("");
        setOpenProductDropdown(false);
        dispatch(fetchAllLookbooksAdmin());
      } else {
        toast({
          title: data?.payload?.message || "Failed to create lookbook",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteLookbook = (id) => {
    dispatch(deleteLookbook(id)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Lookbook deleted successfully" });
        dispatch(fetchAllLookbooksAdmin());
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-background p-6">
        <h2 className="text-lg font-semibold">Create Lookbook</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload model image and link products for Shop The Look.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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

          <div className="relative">
            <label className="mb-2 block text-sm font-medium">Link Products</label>
            <button
              type="button"
              onClick={() => setOpenProductDropdown((prev) => !prev)}
              className="flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-sm"
            >
              <span>
                {selectedProductIds.length > 0
                  ? `${selectedProductIds.length} selected`
                  : "Select products"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {openProductDropdown && (
              <div className="absolute z-20 mt-2 w-full rounded-md border bg-white p-3 shadow-lg">
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="pl-8"
                  />
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedProductIds.includes(product._id)}
                        onCheckedChange={() => handleToggleProduct(product._id)}
                      />
                      <span className="text-sm">{product.title}</span>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground">No products found</p>
                  )}
                </div>
              </div>
            )}

            {selectedProductIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedProductIds.map((id) => {
                  const product = (productList || []).find((item) => item._id === id);
                  if (!product) return null;
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      {product.title}
                    </span>
                  );
                })}
              </div>
            )}

            <Button
              className="mt-6"
              onClick={handleCreateLookbook}
              disabled={isLoading || imageLoadingState}
            >
              Save Lookbook
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-6">
        <h3 className="text-lg font-semibold">Existing Lookbooks</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(lookbookList || []).map((lookbook) => (
            <div key={lookbook._id} className="rounded-md border bg-white p-3">
              <img
                src={lookbook.imageUrl}
                alt="Lookbook"
                className="h-56 w-full object-cover"
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {lookbook.products?.length || 0} linked products
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteLookbook(lookbook._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {(lookbookList || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No lookbook items yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminLookbook;
