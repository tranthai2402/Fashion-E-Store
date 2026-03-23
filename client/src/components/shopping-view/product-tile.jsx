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
      <div className="pt-4 pb-2 text-center">
        <p className="text-[11px] font-normal uppercase tracking-[0.18em] text-gray-900 leading-snug">
          {product?.title}
        </p>
        <p className="text-[11px] font-normal tracking-[0.12em] text-gray-500 mt-1">
          ${displayPrice}
        </p>
      </div>
    </div>
  );
}

export default ShoppingProductTile;
