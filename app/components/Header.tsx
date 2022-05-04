import { Link } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import type { VFC } from "react";
import { memo, useState } from "react";

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

export const Header: VFC = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
    </>
  );
});
Header.displayName = "Header";
