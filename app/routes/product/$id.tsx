import type {
  ActionFunction,
  LoaderFunction,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import {
  Form,
  Link,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { VFC } from "react";
import { Layout } from "~/components/Layout";
import type {
  CartCreateMutation,
  CartQuantityQuery,
  ProductQuery,
} from "~/graphql/shopify/generated";
import {
  CartCreateDocument,
  CartLinesAddDocument,
  CartQuantityDocument,
  ProductDocument,
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
  params,
  request,
}) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};

  const { data } = await shopifyResolver(
    ProductDocument.loc?.source.body,
    { handle: params.id, first: 10 },
  );
  const { product } = data;

  if (!cookie.cartId) {
    return { product };
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

  return { product, quantity };
};

// ここまで
//
//
//
// ここから

export const action: ActionFunction = async ({
  request,
}) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await userPrefs.parse(cookieHeader)) || {};

  const formData = await request.formData();
  const value = Object.fromEntries(formData);
  const { merchandiseId } = value;

  if (!cookie.cartId) {
    const { data } = await shopifyResolver(
      CartCreateDocument.loc?.source.body,
      {
        input: {
          lines: {
            merchandiseId,
          },
        },
      },
    );
    const { cartCreate } = data as CartCreateMutation;
    cookie.cartId = cartCreate?.cart?.id;
    return redirect(`/cart`, {
      headers: {
        "Set-Cookie": await userPrefs.serialize(cookie),
      },
    });
  } else {
    await shopifyResolver(
      CartLinesAddDocument.loc?.source.body,
      {
        lines: {
          merchandiseId,
        },
        cartId: cookie.cartId,
      },
    );

    return redirect(`/cart`);
  }
};

// ここまで
//
//
//
// ここから

const Product: VFC = () => {
  const { product } = useLoaderData() as ProductQuery;
  const { quantity } = useLoaderData();
  const transition = useTransition();
  const isLoading = transition.submission
    ? true
    : transition.state === "loading"
    ? true
    : false;

  return (
    <Layout quantity={quantity} isLoading={isLoading}>
      <div className="mx-auto max-w-[1040px] px-5 pt-10 pb-20">
        <h1 className="pb-5 md:pb-10">{product?.title}</h1>
        <div className="flex flex-col gap-8 pb-10 md:flex-row">
          <div className="basis-1/2">
            <img
              src={
                product?.media.nodes[0].previewImage?.url
              }
              alt=""
              className="w-full"
            />
          </div>
          <div className="flex basis-1/2 flex-col gap-8">
            <p>{product?.description}</p>
            <p>
              ¥
              {price(
                product?.variants.nodes[0].priceV2.amount,
              )}{" "}
              +tax
            </p>
            <div>
              {product?.options.map((option) => (
                <div key={option.name}>
                  <p className="float-left">
                    {option.name}
                  </p>
                  <p className="pl-24">{option.values}</p>
                </div>
              ))}
            </div>
            <Form method="post">
              <input
                type="hidden"
                name="merchandiseId"
                value={product?.variants.nodes[0].id}
              />
              <button
                type="submit"
                className="w-full border border-slate-800 py-5 transition-all hover:border-transparent
                hover:bg-slate-800 hover:text-white"
              >
                カートに入れる
              </button>
            </Form>
          </div>
        </div>
        <div className="text-center">
          <Link to={`/products`} className="capitalize">
            back to products
          </Link>
        </div>
      </div>
    </Layout>
  );
};
export default Product;
