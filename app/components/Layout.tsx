import type { ReactNode, VFC } from "react";
import { memo } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

// ここまで
//
//
//
// ここから

type PROPS = {
  children: ReactNode;
  quantity: number | undefined;
};

// ここまで
//
//
//
// ここから

export const Layout: VFC<PROPS> = memo(
  ({ children, quantity }) => {
    return (
      <div className="flex min-h-screen flex-col">
        <Header quantity={quantity} />
        <div className="grow pt-20">{children}</div>
        <Footer />
      </div>
    );
  },
);
Layout.displayName = "Layout";
