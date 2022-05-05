import { Link } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import type { VFC } from "react";
import { memo, useState } from "react";
import { ImCart } from "react-icons/im";

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

// ここまで
//
//
//
// ここから

type PROPS = {
  quantity: number | undefined;
};

export const Header: VFC<PROPS> = memo(({ quantity }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="fixed mx-auto w-full">
        <div className="relative mx-auto h-20 max-w-[1040px] bg-white px-[4%] md:px-5">
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
          <div className="absolute inset-y-0 right-[calc(4%_+_50px)] flex items-center md:right-20">
            <Link
              to={`/cart`}
              className="flex items-center gap-1"
            >
              <ImCart className="text-xl" />
              <p className="text-xl">
                {!quantity ? 0 : quantity}
              </p>
            </Link>
          </div>
          <div className="absolute inset-y-0 z-0 flex items-center">
            <Link to={`/`}>
              <img
                src="images/logo.svg"
                alt=""
                className="xs:w-full w-[200px]"
              />
            </Link>
          </div>
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
    </>
  );
});
Header.displayName = "Header";
