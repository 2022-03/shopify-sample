import type { LoaderFunction } from "@remix-run/cloudflare";
import {
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { VFC } from "react";
import { Layout } from "~/components/Layout";
import { cartQuantity } from "~/utils/cartQuantity";
import { userPrefs } from "~/utils/cookie";

// ここまで
//
//
//
// ここから

export const loader: LoaderFunction = async ({
  request,
}) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};

  if (!cookie.cartId) {
    return { quantity: 0 };
  }

  const { quantity } = await cartQuantity(cookie.cartId);
  return { quantity };
};

// ここまで
//
//
//
// ここから

const About: VFC = () => {
  const { quantity } = useLoaderData();

  const transition = useTransition();
  const isLoading =
    transition.state === "loading" ? true : false;

  return (
    <Layout quantity={quantity} isLoading={isLoading}>
      <div className="mx-auto flex max-w-[1040px] flex-col gap-5 px-5 pt-5">
        <h1 className="capitalize">about</h1>
        <p className="max-w-[600px]">
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
        </p>
        <p className="max-w-[600px]">
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          テキストテキストテキストテキストテキストテキストテキストテキストテキスト
        </p>
      </div>
    </Layout>
  );
};
export default About;
