import {
  fetchLookbookDetails,
  resetLookbookDetails,
} from "@/store/shop/lookbook-slice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function ShoppingLookbookDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lookbookDetails, isLoading } = useSelector((state) => state.shopLookbook);

  useEffect(() => {
    if (id) {
      dispatch(fetchLookbookDetails(id));
    }
    return () => {
      dispatch(resetLookbookDetails());
    };
  }, [id, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (!lookbookDetails) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-white">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
          Lookbook not found
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-2">
        <div className="bg-white p-6 lg:p-10">
          <div className="sticky top-20">
            <img
              src={lookbookDetails.imageUrl}
              alt="Lookbook visual"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="bg-white p-6 lg:p-10">
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.32em] text-gray-500">
              Shop The Look
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {(lookbookDetails.products || []).map((product) => (
              <button
                key={product._id}
                onClick={() => navigate(`/shop/product/${product._id}`)}
                className="group bg-transparent p-0 border-none text-left cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-auto object-cover"
                />
                <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-gray-700 group-hover:text-black transition-colors">
                  {product.title}
                </p>
                <div className="flex justify-start items-center gap-2 mt-1">
                  <p className={`text-[10px] tracking-[0.12em] text-gray-500 ${product?.salePrice > 0 ? 'line-through opacity-70' : ''}`}>
                    ${product?.price}
                  </p>
                  {product?.salePrice > 0 && (
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-gray-900">
                      ${product?.salePrice}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {(lookbookDetails.products || []).length === 0 && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
              No active products linked to this look
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingLookbookDetail;
