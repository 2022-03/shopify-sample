import type {
  LinksFunction,
  LoaderFunction,
} from "@remix-run/cloudflare";
import {
  Link,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import type { VFC } from "react";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { ImCart } from "react-icons/im";
import type { Settings } from "react-slick";
import Slider from "react-slick";
import slickTheme from "slick-carousel/slick/slick-theme.css";
import slick from "slick-carousel/slick/slick.css";
import { Footer } from "~/components/Footer";
import type { ProductsQuery } from "~/graphql/shopify/generated";
import { ProductsDocument } from "~/graphql/shopify/generated";
import { shopifyResolver } from "~/graphql/shopify/resolver";
import { cartQuantity } from "~/utils/cartQuantity";
import { userPrefs } from "~/utils/cookie";
import { price } from "~/utils/price";

// ここまで
//
//
//
// ここから

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: slick },
    { rel: "stylesheet", href: slickTheme },
  ];
};

// ここまで
//
//
//
// ここから

export const loader: LoaderFunction = async ({
  request,
}) => {
  // Cookie読み込み
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};

  // KV読み込み
  const cachedJson = (await CACHES.get(
    "products-cache",
    "json",
  )) as ProductsQuery;

  //
  //
  //

  // KVに商品データがある
  if (cachedJson) {
    // Cookieにカート情報がない
    if (!cookie.cartId) {
      return { products: cachedJson, quantity: 0 };
    }

    // Cookieにカート情報がある
    const { quantity } = await cartQuantity(cookie.cartId);
    return { products: cachedJson, quantity };
  }

  //
  //
  //

  // KVに商品データがない
  const { data } = await shopifyResolver(
    ProductsDocument.loc?.source.body,
    { first: 50 },
  );
  const { products } = data;
  await CACHES.put(
    "products-cache",
    JSON.stringify(products),
    {
      expirationTtl: 60 * 10,
    },
  );

  // Cookieにカート情報がない
  if (!cookie.cartId) {
    return { products, quantity: 0 };
  }

  // Cookieにカート情報がある
  const { quantity } = await cartQuantity(cookie.cartId);
  return { products, quantity };
};

// ここまで
//
//
//
// ここから

const variantsCenter = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};
const variantsTop = {
  visible: { rotate: 0 },
  hidden: { rotate: 45, y: 14, backgroundColor: "#fff" },
};
const variantsBottom = {
  visible: { rotate: 0 },
  hidden: { rotate: -45, y: -14, backgroundColor: "#fff" },
};

// ここまで
//
//
//
// ここから

const menuItems = [
  "products",
  "about",
  "company",
  "contact",
];

// ここまで
//
//
//
// ここから

const Index: VFC = () => {
  const { products } = useLoaderData() as ProductsQuery;
  const { quantity } = useLoaderData();

  const transition = useTransition();
  const busy = transition.submission;
  const isLoading =
    !busy && transition.state === "loading" ? true : false;

  const [isOpen, setIsOpen] = useState(false);

  const settings: Settings = {
    infinite: true,
    speed: 2000,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
  };

  return (
    <>
      {isLoading && (
        <div>
          <AiOutlineLoading3Quarters className="fixed inset-0 z-20 m-auto h-10 w-10 animate-spin text-slate-400" />
        </div>
      )}

      <div className="fixed right-[4%] top-[4%] z-20 flex items-center md:right-10 md:top-10">
        <motion.button
          className="relative inline-block h-[40px] w-[40px] bg-[rgba(255,255,255,0.5)]"
          onClick={() => setIsOpen((isOpen) => !isOpen)}
        >
          <motion.span
            className="absolute top-[5px] left-[5px] my-auto inline-block h-[2px] w-[30px] bg-slate-800"
            variants={variantsTop}
            animate={isOpen ? "hidden" : "visible"}
          ></motion.span>
          <motion.span
            className="absolute inset-y-0 left-[5px] my-auto inline-block h-[2px] w-[30px] bg-slate-800"
            variants={variantsCenter}
            animate={isOpen ? "hidden" : "visible"}
          ></motion.span>
          <motion.span
            className="absolute left-[5px] bottom-[5px] my-auto inline-block h-[2px] w-[30px] bg-slate-800"
            variants={variantsBottom}
            animate={isOpen ? "hidden" : "visible"}
          ></motion.span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 z-10 h-screen w-screen bg-[rgba(0,0,0,0.8)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mx-auto mt-20 flex max-w-[1040px] flex-col gap-5 px-5 text-center text-xl md:text-left">
              {menuItems.map((item) => (
                <div key={item}>
                  <Link
                    to={`/${item}`}
                    className="inline-block uppercase text-white"
                  >
                    {item}
                  </Link>
                </div>
              ))}
              <div className="">
                <Link
                  to={`/cart`}
                  className="inline-flex items-center gap-1 text-white"
                >
                  <ImCart className="text-xl" />
                  <p className="w-5 text-center text-xl">
                    {quantity}
                  </p>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="relative overflow-hidden">
        <Slider {...settings}>
          {products.nodes.slice(1, 5).map((image) => (
            <li key={image.handle}>
              <img
                src={image.images.nodes[0].url}
                alt=""
                className="h-screen w-full object-cover"
              />
            </li>
          ))}
        </Slider>
        <div className="absolute inset-0 m-auto flex items-center justify-center">
          <Link to={`/`}>
            <img
              src="/images/logo.svg"
              alt=""
              className="w-full bg-[rgba(255,255,255,0.5)] p-10"
            />
          </Link>
        </div>
      </ul>

      <div className="mx-auto mt-10 grid max-w-[1040px] grid-cols-2 gap-4 px-[4%] md:grid-cols-4 md:gap-7 md:px-5">
        {products.nodes.slice(0, 8).map((product) => (
          <Link
            to={`product/${product.handle}`}
            key={product.handle}
          >
            <div>
              <img
                src={product.images.nodes[0].url}
                alt={product.handle}
              />
            </div>
            <div>
              <p>{product.title}</p>
              <p>
                ¥
                {price(
                  product.variants.nodes[0].priceV2.amount,
                )}{" "}
                +tax
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="my-10 text-center md:mb-20">
        <Link to={`/products`} className="capitalize">
          to products page
        </Link>
      </div>
      <Footer />
    </>
  );
};
export default Index;
