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
                className="grid auto-cols-max grid-flow-row-dense grid-cols-3 grid-rows-2 items-center gap-x-4 md:grid-cols-5 md:grid-rows-1 md:gap-10"
              >
                <div className="col-span-1 row-span-2 md:col-span-1 md:row-span-1">
                  <img
                    src={
                      item.merchandise.product.featuredImage
                        ?.url
                    }
                    alt=""
                    className=""
                  />
                </div>
                <div className="col-span-2 place-self-start md:col-span-2 md:place-self-center">
                  <p>{item.merchandise.product.title}</p>
                  <p className="text-xs text-slate-400">
                    ¥
                    {price(
                      item.merchandise.product.variants
                        .edges[0].node.priceV2.amount,
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-5 justify-self-center border md:col-end-5">
                  <button className="p-3 md:py-5">-</button>
                  <p>{item.quantity}</p>
                  <button className="p-3 md:py-5">+</button>
                </div>
                <p className="justify-self-end md:col-end-6">
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
