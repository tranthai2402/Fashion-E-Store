import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const totalStock =
    product?.variants && product?.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
      : product?.totalStock;

  return (
    <div className="grid gap-4 px-4 py-4 md:grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_140px] md:items-center">
      <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-white">
        <img
          src={product?.image}
          alt={product?.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold truncate">{product?.title}</h3>
          {/* {product?.variants && product?.variants.length > 0 ? (
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0.5 uppercase bg-blue-100 text-blue-800"
            >
            </Badge>
          ) : null} */}
        </div>

        <div className="flex flex-col gap-2">
          {product?.sizes && product?.sizes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {product?.sizes.map((size) => (
                <Badge key={size} variant="secondary" className="text-[10px] px-1 py-0 uppercase">
                  {size}
                </Badge>
              ))}
            </div>
          ) : null}
          {product?.colors && product?.colors.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {product?.colors.map((color) => (
                <div
                  key={color}
                  className="h-3 w-3 rounded-sm border border-muted"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="text-sm font-medium text-muted-foreground">{totalStock}</div>

      <div className="text-sm font-semibold">${product?.price}</div>

      <div className="text-sm font-semibold text-red-600">
        {product?.salePrice > 0 ? `$${product?.salePrice}` : "—"}
      </div>

      <div>
        {totalStock <= 0 ? (
          <Badge variant="destructive" className="text-[10px] px-2 py-0.5 uppercase">
            Out of Stock
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 uppercase">
            In Stock
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button
          size="sm"
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setCurrentEditedId(product?._id);
            setFormData(product);
          }}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleDelete(product?._id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default AdminProductTile;
