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
  condition?: "idle" | "submitting" | "loading";
};

// ここまで
//
//
//
// ここから

export const Layout: VFC<PROPS> = memo(
  ({ children, quantity, condition }) => {
    return (
      <div className="flex min-h-screen flex-col">
        <Header quantity={quantity} condition={condition} />
        <div className="grow pt-20">{children}</div>
        <Footer />
      </div>
    );
  },
);
Layout.displayName = "Layout";
