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

  const products = lookbookDetails.products || [];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 lg:grid-cols-2">
        <div className="bg-white p-6 lg:p-12 border-r border-slate-50 flex items-center justify-center">
          <div className="sticky top-24 w-full">
            <img
              src={lookbookDetails.imageUrl}
              alt="Lookbook visual"
              className="w-full h-auto object-cover rounded-xl shadow-2xl"
            />
          </div>
        </div>

        <div className="bg-white p-6 lg:p-12 overflow-y-auto">
          <div className="mb-12">
             <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">Shop The Look</h2>
             <div className="h-1 w-12 bg-sky-500 rounded-full"></div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Discover the items featured in this collection</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/shop/product/${product._id}`)}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-md transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4">
                   <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider group-hover:text-sky-600 transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-xs font-bold text-slate-900`}>
                      ${product.salePrice > 0 ? product.salePrice : product.price}
                    </p>
                    {product.salePrice > 0 && (
                      <p className="text-[10px] text-slate-400 line-through">
                        ${product.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-300">
                No active products found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingLookbookDetail;
