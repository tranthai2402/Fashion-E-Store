import { fetchLookbookList } from "@/store/shop/lookbook-slice";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function ShoppingLookbook() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lookbookList } = useSelector((state) => state.shopLookbook);

  useEffect(() => {
    dispatch(fetchLookbookList());
  }, [dispatch]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white px-6 py-16 md:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <h1 className="text-[11px] font-bold uppercase tracking-[0.4em] text-gray-900 mb-4">
            LOOKBOOKS
          </h1>
          <div className="h-px w-16 bg-gray-200 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-20">
          {(lookbookList || []).map((look) => (
            <div
              key={look._id}
              onClick={() => navigate(`/shop/lookbook/${look._id}`)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 rounded-sm">
                <img
                  src={look.imageUrl}
                  alt={look.title || "Lookbook"}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="px-6 py-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.2em] text-black shadow-xl">
                    View Collection
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(lookbookList || []).length === 0 && (
          <div className="py-24 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
              No collections available at this time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingLookbook;
