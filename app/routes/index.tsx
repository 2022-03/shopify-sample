import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import type { VFC } from "react";
import { Layout } from "~/components/Layout";
import type {
  CartQuantityQuery,
  ProductsQuery,
} from "~/graphql/shopify/generated";
import {
  CartQuantityDocument,
  ProductsDocument,
} from "~/graphql/shopify/generated";
import { shopifyResolver } from "~/graphql/shopify/resolver";
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
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};

  const { data } = await shopifyResolver(
    ProductsDocument.loc?.source.body,
    { first: 8 },
  );
  const { products } = data;

  if (!cookie.cartId) {
    return { products };
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

  return { products, quantity };
};

// ここまで
//
//
//
// ここから

const Index: VFC = () => {
  const { products } = useLoaderData() as ProductsQuery;
  const { quantity } = useLoaderData();

  return (
    <Layout quantity={quantity}>
      <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-4 px-[4%] md:grid-cols-4 md:gap-7 md:px-5">
        {products.nodes.map((product) => (
          <Link
            to={`product/${product.handle}`}
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
                  product.priceRange.maxVariantPrice.amount,
                )}{" "}
                +tax
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="my-10 text-center md:mb-20">
        <Link to={`/products`} className="capitalize">
          view more
        </Link>
      </div>
    </Layout>
  );
};
export default Index;
