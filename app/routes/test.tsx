import type { LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { VFC } from "react";
import type { ProductsQuery } from "~/graphql/shopify/generated";
import { ProductsDocument } from "~/graphql/shopify/generated";
import { shopifyResolver } from "~/graphql/shopify/resolver";

// ここまで
//
//
//
// ここから

export const loader: LoaderFunction = async () => {
  const cachedJson = (await CACHES.get(
    "cache-key",
    "json",
  )) as ProductsQuery;

  if (cachedJson) {
    console.log(cachedJson);

    return { products: cachedJson };
  }

  const { data } = await shopifyResolver(
    ProductsDocument.loc?.source.body,
    { first: 8 },
  );
  const { products } = data;

  await CACHES.put("cache-key", JSON.stringify(products), {
    expirationTtl: 60 * 60,
  });

  return { products };
};

// ここまで
//
//
//
// ここから

const Test: VFC = () => {
  const { products } = useLoaderData() as ProductsQuery;

  console.log(products);

  return <>テストページ</>;
};
export default Test;
