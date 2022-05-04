import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import type { VFC } from "react";
import { useState } from "react";
import type { ProductsQuery } from "~/graphql/shopify/generated";
import { ProductsDocument } from "~/graphql/shopify/generated";
import { shopifyResolver } from "~/graphql/shopify/resolver";
import { price } from "~/utils/price";

// ここまで
//
//
//
// ここから

export const loader: LoaderFunction = async () => {
  const { data } = await shopifyResolver(
    ProductsDocument.loc?.source.body,
    { first: 8 },
  );
  const { products } = data;

  return { products };
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
  hidden: { rotate: 45, y: 9, backgroundColor: "#fff" },
};
const variantsBottom = {
  visible: { rotate: 0 },
  hidden: { rotate: -45, y: -9, backgroundColor: "#fff" },
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

const linkItems = [
  { name: "instagram", url: "https://www.instagram.com" },
  { name: "twitter", url: "https://twitter.com" },
  { name: "facebook", url: "https://www.facebook.com" },
];

// ここまで
//
//
//
// ここから

const Index: VFC = () => {
  const { products } = useLoaderData() as ProductsQuery;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ヘッダー */}
      <header className="fixed mx-auto h-20 w-full bg-white">
        <div className="relative mx-auto max-w-[1040px] px-[4%] md:px-5">
          <div className="absolute right-[4%] z-20 flex h-20 items-center md:right-5">
            <motion.button
              className="relative inline-block h-[30px] w-[30px]"
              onClick={() => setIsOpen((isOpen) => !isOpen)}
            >
              <motion.span
                className="absolute top-[5px] left-0 my-auto inline-block h-[2px] w-[30px] bg-slate-800"
                variants={variantsTop}
                animate={isOpen ? "hidden" : "visible"}
              ></motion.span>
              <motion.span
                className="absolute inset-y-0 left-0 my-auto inline-block h-[2px] w-[30px] bg-slate-800"
                variants={variantsCenter}
                animate={isOpen ? "hidden" : "visible"}
              ></motion.span>
              <motion.span
                className="absolute bottom-[5px] left-0 my-auto inline-block h-[2px] w-[30px] bg-slate-800"
                variants={variantsBottom}
                animate={isOpen ? "hidden" : "visible"}
              ></motion.span>
            </motion.button>
          </div>
          <div className="absolute z-0 flex h-20 items-center">
            <img src="images/logo.svg" alt="" />
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed z-10 h-screen w-screen bg-[rgba(0,0,0,0.8)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mx-auto mt-20 flex max-w-[1040px] flex-col gap-5 px-5 text-center text-xl md:text-left">
                {menuItems.map((item) => (
                  <div key={item} className="">
                    <Link
                      to={`/${item}`}
                      className="inline-block uppercase text-white"
                    >
                      {item}
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 商品一覧 */}
      <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-4 px-[4%] pt-20 md:grid-cols-4 md:gap-7 md:px-5">
        {products.nodes.map((product) => (
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
                  product.priceRange.maxVariantPrice.amount,
                )}{" "}
                +tax
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="my-10 text-center md:mb-20">
        <Link to={`/products`} className="capitalize">
          view more
        </Link>
      </div>

      {/* フッター */}
      <footer className="mx-auto mb-5 flex max-w-[1040px] flex-col items-center gap-4 px-[4%] md:flex-row md:justify-between md:gap-0 md:px-5">
        <div className="flex gap-5">
          {linkItems.map((item) => (
            <a
              href={`${item.url}`}
              key={item.name}
              className="capitalize"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div>
          <img
            src="images/copyright.svg"
            alt=""
            className="h-3"
          />
        </div>
      </footer>
    </>
  );
};
export default Index;
