import { useNavigate } from "react-router-dom";

function ShoppingProductTile({ product }) {
  const navigate = useNavigate();

  const displayPrice =
    product?.salePrice > 0 ? product.salePrice : product?.price;

  return (
    <div
      onClick={() => navigate(`/shop/product/${product?._id}`)}
      className="group cursor-pointer bg-transparent"
    >
      {/* Image */}
      <div className="overflow-hidden bg-[#f5f5f0]">
        <img
          src={product?.image}
          alt={product?.title}
          className="w-full aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      {/* Label */}
      <div className="pt-4 pb-2 text-center px-2">
        <p className="text-[11px] font-normal uppercase tracking-[0.18em] text-gray-900 leading-snug">
          {product?.title}
        </p>
        <div className="flex justify-center items-center gap-2 mt-1">
          <p className={`text-[11px] font-normal tracking-[0.12em] text-gray-500 ${product?.salePrice > 0 ? 'line-through opacity-70' : ''}`}>
            ${product?.price}
          </p>
          {product?.salePrice > 0 && (
            <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-900">
              ${product?.salePrice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingProductTile;
