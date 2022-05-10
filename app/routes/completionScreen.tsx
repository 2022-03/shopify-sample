import type { LoaderFunction } from "@remix-run/cloudflare";
import {
  Link,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { VFC } from "react";
import { Layout } from "~/components/Layout";
import type { CartQuantityQuery } from "~/graphql/shopify/generated";
import { CartQuantityDocument } from "~/graphql/shopify/generated";
import { shopifyResolver } from "~/graphql/shopify/resolver";
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
    const quantity = 0;
    return { quantity };
  }

  const { data: quantityData } = await shopifyResolver(
    CartQuantityDocument.loc?.source.body,
    { id: cookie.cartId, first: 20 },
  );
  const { cart } = quantityData as CartQuantityQuery;
  const quantity = cart?.lines.nodes.reduce(
    (sum, i) => sum + i.quantity,
    0,
  );

  return { quantity };
};

// ここまで
//
//
//
// ここから

const CompletionScreen: VFC = () => {
  const { quantity } = useLoaderData();

  const transition = useTransition();
  const isLoading =
    transition.state === "loading" ? true : false;

  return (
    <Layout quantity={quantity} isLoading={isLoading}>
      <h1>お問い合わせ内容を送信しました</h1>
      <Link to={`/`}>ホームへ</Link>
    </Layout>
  );
};
export default CompletionScreen;
