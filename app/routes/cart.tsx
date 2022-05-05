import type { LoaderFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import type { VFC } from "react";
import { Layout } from "~/components/Layout";
import type { CartQuery } from "~/graphql/shopify/generated";
import { CartDocument } from "~/graphql/shopify/generated";
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

  if (!cookie.cartId) {
    return redirect(`/`);
  }

  const { data } = await shopifyResolver(
    CartDocument.loc?.source.body,
    {
      id: cookie.cartId,
      first: 10,
    },
  );
  const { cart } = data as CartQuery;

  const quantity = cart?.lines.nodes.reduce(
    (sum, i) => sum + i.quantity,
    0,
  );

  return { cart, quantity };
};

const Cart: VFC = () => {
  const { cart } = useLoaderData() as CartQuery;
  const { quantity } = useLoaderData();

  console.log(
    cart?.lines.nodes[0].merchandise.product.title,
  );

  return (
    <>
      <Layout quantity={quantity}>
        <div className="mx-auto mt-10 max-w-[1040px] px-5">
          <div className="flex justify-between">
            <h1>ショッピングカート</h1>
            <Link to={`/products`}>買い物を続ける</Link>
          </div>
          <div className="mx-auto mt-8 mb-20 flex max-w-[840px] flex-col gap-5">
            {cart?.lines.nodes.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-5 items-center gap-10"
              >
                <div>
                  <img
                    src={
                      item.merchandise.product.featuredImage
                        ?.url
                    }
                    alt=""
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <p>{item.merchandise.product.title}</p>
                  <p className="text-xs text-slate-400">
                    ¥
                    {price(
                      item.merchandise.product.variants
                        .edges[0].node.priceV2.amount,
                    )}
                  </p>
                </div>
                <div className="col-end-5 flex items-center gap-5 justify-self-center border">
                  <button className="py-5 px-3">-</button>
                  <p>{item.quantity}</p>
                  <button className="py-5 px-3">+</button>
                </div>
                <p className="col-end-6 justify-self-end">
                  ¥
                  {price(
                    item.estimatedCost.totalAmount.amount,
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};
export default Cart;
