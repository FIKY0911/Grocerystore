import { defineQuery } from "next-sanity";

const BRANDS_QUERY = defineQuery(`*[_type=='brand'] | order(name asc) `);

const LATEST_BLOG_QUERY = defineQuery(
  ` *[_type == 'blog' && isLatest == true]|order(name asc){
      ...,
      blogcategories[]->{
      title
    }
    }`
);

const DEAL_PRODUCTS = defineQuery(
  `*[_type == 'product' && status == 'hot'] | order(name asc){
    ...,"categories": categories[]->title
  }`
);

const PRODUCT_BY_SLUG_QUERY = defineQuery(
  `*[_type == "product" && slug.current == $slug] | order(name asc) [0]`
);

const BRAND_QUERY = defineQuery(`*[_type == "product" && slug.current == $slug]{
  "brandName": brand->title
  }`);

const MY_ORDERS_QUERY = defineQuery(`*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
  _id,
  orderNumber,
  orderDate,
  totalPrice,
  status,
  paymentUrl,
  stockReduced,
  "productsCount": count(products),
  products[]{
    quantity,
    priceAtPurchase,
    product->{
      _id,
      name,
      images,
      price,
      "slug": slug.current
    }
  },
  address->{
    _id,
    name,
    address,
    city,
    phone
  },
  shipper->{
    _id,
    name
  }
}`);

const ORDER_BY_ID_QUERY = defineQuery(`*[_type == "order" && orderNumber == $orderNumber][0] {
  _id,
  orderNumber,
  customerName,
  email,
  status,
  xenditStatus,
  totalPrice,
  orderDate,
  address,
  paymentUrl,
  paymentToken,
  "productDetails": products[] {
    quantity,
    priceAtPurchase,
    product->{
      _id,
      name,
      images,
      "slug": slug.current
    }
  }
}`);

// 🆕 Query lengkap untuk halaman invoice
const INVOICE_QUERY = defineQuery(`*[_type == "order" && orderNumber == $orderNumber][0] {
  _id,
  orderNumber,
  clerkUserId,
  customerName,
  email,
  status,
  xenditStatus,
  xenditTransactionId,
  totalPrice,
  currency,
  amountDiscount,
  orderDate,
  expiryDate,
  paymentUrl,
  paymentToken,
  merchantName,
  merchantProfilePictureUrl,
  shouldExcludeCreditCard,
  availableBanks,
  availableRetailOutlets,
  availableEwallets,
  availableQRCodes,
  availableDirectDebits,
  availablePaylaters,
  successRedirectUrl,
  failureRedirectUrl,
  address->{
    _id,
    name,
    address,
    city,
    state,
    zip,
    phone
  },
  shipper->{
    _id,
    name
  },
  products[]{
    quantity,
    priceAtPurchase,
    product->{
      _id,
      name,
      images,
      variant,
      "slug": slug.current
    }
  }
}`);

const GET_ALL_BLOG = defineQuery(
  `*[_type == 'blog'] | order(publishedAt desc)[0...$quantity]{
  ...,  
     blogcategories[]->{
    title
}
    }
  `
);

const SINGLE_BLOG_QUERY =
  defineQuery(`*[_type == "blog" && slug.current == $slug][0]{
  ..., 
    author->{
    name,
    image,
  },
  blogcategories[]->{
    title,
    "slug": slug.current,
  },
}`);

const BLOG_CATEGORIES = defineQuery(
  `*[_type == "blog"]{
     blogcategories[]->{
    ...
    }
  }`
);

const OTHERS_BLOG_QUERY = defineQuery(`*[
  _type == "blog"
  && defined(slug.current)
  && slug.current != $slug
]|order(publishedAt desc)[0...$quantity]{
...
  publishedAt,
  title,
  mainImage,
  slug,
  author->{
    name,
    image,
  },
  categories[]->{
    title,
    "slug": slug.current,
  }
}`);

export {
  BRANDS_QUERY,
  LATEST_BLOG_QUERY,
  DEAL_PRODUCTS,
  PRODUCT_BY_SLUG_QUERY,
  BRAND_QUERY,
  MY_ORDERS_QUERY,
  ORDER_BY_ID_QUERY,
  INVOICE_QUERY, // 🆕 Export query invoice
  GET_ALL_BLOG,
  SINGLE_BLOG_QUERY,
  BLOG_CATEGORIES,
  OTHERS_BLOG_QUERY,
};
