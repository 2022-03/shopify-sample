import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import type { VFC } from "react";
import { useState } from "react";
import type { ProductsQuery } from "~/graphql/shopify/generated";
import { ProductsDocument } from "~/graphql/shopify/generated";
import { shopifyResolver } from "~/graphql/shopify/resolver";

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
  const [isOpen, setIsOpen] = useState(false);
  console.log(isOpen);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed h-screen w-screen bg-[rgba(0,0,0,0.8)]"
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
      <header className="fixed mx-auto w-full">
        <div className="mx-auto flex h-20 max-w-[1040px] items-center justify-between px-5">
          <img src="images/logo.svg" alt="" />
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
      </header>
      <div className=" pt-20">
        {products.nodes.map((product, index) => (
          <p key={index}>{product.title}</p>
        ))}
      </div>
    </>
  );
};
export default Index;
