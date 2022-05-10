import type { ReactNode, VFC } from "react";
import { memo } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
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
  busy?: any;
  isLoading: boolean;
};

// ここまで
//
//
//
// ここから

export const Layout: VFC<PROPS> = memo(
  ({ children, quantity, busy, isLoading }) => {
    return (
      <>
        {isLoading && (
          <div>
            <AiOutlineLoading3Quarters className="fixed inset-0 z-20 m-auto h-10 w-10 animate-spin text-slate-400" />
          </div>
        )}
        <div className="flex min-h-screen flex-col">
          <Header quantity={quantity} busy={busy} />
          <div className="grow pt-20">{children}</div>
          <Footer />
        </div>
      </>
    );
  },
);
Layout.displayName = "Layout";
