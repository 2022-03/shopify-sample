import type {
  ActionFunction,
  LoaderFunction,
} from "@remix-run/cloudflare";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
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
    { first: 12 },
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
  const moreProducts = useActionData() as ProductsQuery;

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
        {products.nodes.map((product) => (
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
                  product.priceRange.maxVariantPrice.amount,
                )}{" "}
                +tax
              </p>
            </div>
          </Link>
        ))}
      </div>
      {!moreProducts ? (
        <Form
          method="post"
          className="relative pb-20 pt-10 text-center"
        >
          <input
            type="hidden"
            name="start"
            value={
              products.edges[products.edges.length - 1]
                .cursor
            }
          />
          <button type="submit" className="capitalize">
            read more
          </button>
        </Form>
      ) : (
        <div className="mx-auto mt-4 mb-20 grid max-w-[1040px] grid-cols-2 gap-4 px-[4%] md:mt-7 md:grid-cols-4 md:gap-7 md:px-5">
          {moreProducts.products.nodes.map((product) => (
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
                    product.priceRange.maxVariantPrice
                      .amount,
                  )}{" "}
                  +tax
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
};
export default Index;
