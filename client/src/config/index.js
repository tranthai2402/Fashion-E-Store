export const registerFormControls = [
  {
    name: "email",
    label: "User Name or Email",
    placeholder: "Enter your user name or email",
    componentType: "input",
    type: "text",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email or User Name",
    placeholder: "Enter your email or user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
      { id: "accessories", label: "Accessories" },
      { id: "footwear", label: "Footwear" },
      { id: "jewelry", label: "Jewelry" },
      { id: "handbag", label: "Handbag" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "levi", label: "Levi's" },
      { id: "zara", label: "Zara" },
      { id: "h&m", label: "H&M" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
    min: "0",
  },
  {
    label: "Sizes",
    name: "sizes",
    componentType: "tag-input",
    placeholder: "Type size and press Enter (e.g. M, L, XL)",
  },
  {
    label: "Colors",
    name: "colors",
    componentType: "tag-input",
    placeholder: "Type color and press Enter (e.g. Red, Black)",
  },
  {
    label: "Bestseller",
    name: "isBestSeller",
    componentType: "checkbox",
    placeholder: "Đánh dấu là sản phẩm Bestseller",
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/shop/listing",
  },
  {
    id: "lookbook",
    label: "Lookbook",
    path: "/shop/lookbook",
  },
  {
    id: "about",
    label: "About Us",
    path: "/shop/about",
  },
  {
    id: "services",
    label: "Services",
    path: "/shop/services",
  },
];

export const categoryOptionsMap = {
  men: "Men",
  women: "Women",
  accessories: "Accessories",
  footwear: "Footwear",
  jewelry: "Jewelry",
  handbag: "Handbag",
};

export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi",
  zara: "Zara",
  "h&m": "H&M",
};

export const filterOptions = {
  category: [
    { id: "men", label: "Men" },
    { id: "women", label: "Women" },
    { id: "accessories", label: "Accessories" },
    { id: "footwear", label: "Footwear" },
    { id: "jewelry", label: "Jewelry" },
    { id: "handbag", label: "Handbag" },
  ],
  brand: [
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "puma", label: "Puma" },
    { id: "levi", label: "Levi's" },
    { id: "zara", label: "Zara" },
    { id: "h&m", label: "H&M" },
  ],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];

export const userProfileFormControls = [
  {
    label: "User Name",
    name: "userName",
    componentType: "input",
    type: "text",
    placeholder: "Enter your user name",
  },
  {
    label: "Email",
    name: "email",
    componentType: "input",
    type: "email",
    placeholder: "Enter your email",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "tel",
    placeholder: "Enter your phone number",
  },
];
