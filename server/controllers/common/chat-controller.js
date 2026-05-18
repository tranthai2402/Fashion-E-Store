const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../../models/Product");

const SYSTEM_PROMPT = `Bạn là nhân viên tư vấn thời trang cao cấp của Saint Laurent.
Nhiệm vụ: hỗ trợ khách hàng tìm sản phẩm, tư vấn phối đồ, trả lời câu hỏi về đơn hàng và chính sách cửa hàng.

Quy tắc:
- Trả lời bằng tiếng Việt, lịch sự, ngắn gọn (tối đa 3-4 câu trừ khi cần liệt kê sản phẩm).
- Khi giới thiệu sản phẩm, luôn kèm tên, giá gốc, giá sale (nếu có), và size/màu có sẵn.
- Định dạng giá theo USD (ví dụ: $120).
- Nếu không tìm thấy sản phẩm phù hợp, gợi ý khách tìm kiếm với từ khóa khác hoặc xem danh mục.
- Chỉ trả lời trong phạm vi cửa hàng thời trang, từ chối lịch sự các câu hỏi ngoài lề.
- Không sử dụng markdown phức tạp, chỉ dùng text thuần và xuống dòng.`;

function extractKeywords(message) {
  const stopWords = new Set([
    "tôi", "muốn", "tìm", "có", "không", "nào", "cho",
    "cái", "chiếc", "đôi", "bộ", "một", "của", "và",
    "hay", "hoặc", "với", "trong", "giá", "dưới", "trên",
    "khoảng", "được", "bao", "nhiêu", "the", "a", "an",
    "is", "are", "do", "does", "can", "i", "want", "need",
    "looking", "for", "any", "some", "please", "thanks",
    "hi", "hello", "xin", "chào", "ơi", "vậy", "thế",
    "này", "đó", "kia", "rồi", "nhé", "nha", "ạ",
  ]);

  return message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));
}

async function findRelevantProducts(message) {
  const keywords = extractKeywords(message);
  if (keywords.length === 0) return [];

  const searchQuery = keywords.join(" ");

  let products = await Product.find(
    { $text: { $search: searchQuery }, isActive: true },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(6)
    .select("title category brand price salePrice sizes colors totalStock")
    .lean();

  if (products.length === 0) {
    const regexPatterns = keywords.map(
      (k) => new RegExp(k, "i")
    );
    products = await Product.find({
      isActive: true,
      $or: [
        { title: { $in: regexPatterns } },
        { category: { $in: regexPatterns } },
        { brand: { $in: regexPatterns } },
        { description: { $in: regexPatterns } },
      ],
    })
      .limit(6)
      .select("title category brand price salePrice sizes colors totalStock")
      .lean();
  }

  return products;
}

function formatProductsForPrompt(products) {
  if (!products.length) return "Không tìm thấy sản phẩm nào phù hợp trong kho.";

  return products
    .map((p, i) => {
      const price = p.salePrice
        ? `$${p.salePrice} (gốc: $${p.price})`
        : `$${p.price}`;
      const sizes = p.sizes?.length ? p.sizes.join(", ") : "N/A";
      const colors = p.colors?.length ? p.colors.join(", ") : "N/A";
      const stock = p.totalStock > 0 ? "Còn hàng" : "Hết hàng";
      return `${i + 1}. ${p.title} | ${p.category} | ${p.brand} | Giá: ${price} | Size: ${sizes} | Màu: ${colors} | ${stock}`;
    })
    .join("\n");
}

let genAI = null;

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE") {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tin nhắn",
      });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        success: false,
        message: "Chatbot chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY.",
      });
    }

    const products = await findRelevantProducts(message);
    const productContext = formatProductsForPrompt(products);

    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    const mapped = history.slice(-10).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
    const firstUserIdx = mapped.findIndex((m) => m.role === "user");
    const chatHistory = firstUserIdx > 0 ? mapped.slice(firstUserIdx) : firstUserIdx === 0 ? mapped : [];

    const chat = model.startChat({
      history: chatHistory,
    });

    const userPrompt = `Câu hỏi khách hàng: "${message}"

Dữ liệu sản phẩm tìm được từ cửa hàng:
${productContext}

Hãy trả lời khách hàng dựa trên thông tin sản phẩm trên (nếu có liên quan). Nếu không liên quan đến sản phẩm cụ thể, hãy trả lời như nhân viên tư vấn.`;

    const result = await chat.sendMessage(userPrompt);
    const response = result.response.text();

    return res.status(200).json({
      success: true,
      data: {
        reply: response,
        productsFound: products.length,
      },
    });
  } catch (error) {
    console.error("[Chat] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.",
    });
  }
};

module.exports = { handleChat };
