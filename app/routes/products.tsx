import type {
  ActionFunction,
  LoaderFunction,
} from "@remix-run/cloudflare";
import {
  Link,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { VFC } from "react";
import { useState } from "react";
import { Layout } from "~/components/Layout";
import type { ProductsQuery } from "~/graphql/shopify/generated";
import { ProductsDocument } from "~/graphql/shopify/generated";
import { shopifyResolver } from "~/graphql/shopify/resolver";
import { cartQuantity } from "~/utils/cartQuantity";
import { userPrefs } from "~/utils/cookie";
import { price } from "~/utils/price";

// ここまで
//
//
//
// ここから

export const loader: LoaderFunction = async ({
  request,
}) => {
  // Cookie読み込み
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};

  // KV読み込み
  const cachedJson = (await CACHES.get(
    "products-cache",
    "json",
  )) as ProductsQuery;

  // KVに商品データがある
  if (cachedJson) {
    // Cookieにカート情報がない
    if (!cookie.cartId) {
      return { products: cachedJson, quantity: 0 };
    }

    // Cookieにカート情報がある
    const { quantity } = await cartQuantity(cookie.cartId);
    return { products: cachedJson, quantity };
  }

  // KVに商品データがない
  const { data } = await shopifyResolver(
    ProductsDocument.loc?.source.body,
    { first: 50 },
  );
  const { products } = data;
  await CACHES.put(
    "products-cache",
    JSON.stringify(products),
    {
      expirationTtl: 60 * 10,
    },
  );

  // Cookieにカート情報がない
  if (!cookie.cartId) {
    return { products, quantity: 0 };
  }

  // Cookieにカート情報がある
  const { quantity } = await cartQuantity(cookie.cartId);
  return { products, quantity };
};

// ここまで
//
//
//
// ここから

export const action: ActionFunction = async ({
  request,
}) => {
  const formData = await request.formData();
  const value = Object.fromEntries(formData);
  const { start } = value;

  const { data } = await shopifyResolver(
    ProductsDocument.loc?.source.body,
    { first: 4, after: start },
  );
  const { products } = data;

  return { products };
};

// ここまで
//
//
//
// ここから

const Index: VFC = () => {
  const { products } = useLoaderData() as ProductsQuery;
  const { quantity } = useLoaderData();
  const [isMore, setIsMore] = useState(false);

  const transition = useTransition();
  const busy = transition.submission;
  const isLoading =
    busy || transition.state === "loading" ? true : false;

  return (
    <Layout quantity={quantity} isLoading={isLoading}>
      <div className="mx-auto max-w-[1040px] px-5 pt-10 pb-5 md:pb-10">
        <h1 className="capitalize">products</h1>
      </div>
      <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-4 px-[4%] md:grid-cols-4 md:gap-7 md:px-5">
        {products.nodes.slice(0, 12).map((product) => (
          <Link
            to={`/product/${product.handle}`}
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
                  product.variants.nodes[0].priceV2.amount,
                )}{" "}
                +tax
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div>
        {isMore ? (
          <div className="mx-auto mt-4 mb-20 grid max-w-[1040px] grid-cols-2 gap-4 px-[4%] md:mt-7 md:grid-cols-4 md:gap-7 md:px-5">
            {products.nodes.slice(12).map((product) => (
              <Link
                to={`/product/${product.handle}`}
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
                      product.variants.nodes[0].priceV2
                        .amount,
                    )}{" "}
                    +tax
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="pb-20 pt-10 text-center">
            <button
              className="capitalize"
              onClick={() => setIsMore(!isMore)}
            >
              read more
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Index;
