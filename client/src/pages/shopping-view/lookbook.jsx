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
    <div className="min-h-[calc(100vh-56px)] bg-white px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.34em] text-gray-500">
            Lookbook
          </p>
        </div>

        <div className="columns-1 gap-8 space-y-8 sm:columns-2 lg:columns-3">
          {(lookbookList || []).map((look) => (
            <button
              key={look._id}
              onClick={() => navigate(`/shop/lookbook/${look._id}`)}
              className="group relative block w-full break-inside-avoid overflow-hidden bg-transparent border-none p-0 cursor-pointer"
            >
              <img
                src={look.imageUrl}
                alt="Lookbook"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black">
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {(lookbookList || []).length === 0 && (
          <div className="py-24 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
              No lookbook items available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingLookbook;
