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
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Layout } from "~/components/Layout";
import type { CartQuery } from "~/graphql/shopify/generated";
import {
  CartDocument,
  CartLinesUpdateDocument,
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

  const allQuantity = cart?.lines.nodes.reduce(
    (sum, i) => sum + i.quantity,
    0,
  );

  return { cart, allQuantity };
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
  const { id, quantity } = value;

  await shopifyResolver(
    CartLinesUpdateDocument.loc?.source.body,
    {
      cartId: cookie.cartId,
      lines: [
        {
          id,
          quantity: Number(quantity),
        },
      ],
    },
  );

  return redirect(`/cart`);
};

// ここまで
//
//
//
// ここから

const Cart: VFC = () => {
  const { cart } = useLoaderData() as CartQuery;
  const { allQuantity } = useLoaderData();
  const [cartState, setCartState] = useState(
    cart?.lines.nodes,
  );
  const transition = useTransition();
  const busy = transition.submission;
  const isLoading =
    !busy && transition.state === "loading" ? true : false;

  useEffect(() => {
    setCartState(
      cartState?.filter((q) => q.quantity !== 0),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  return (
    <Layout
      quantity={allQuantity}
      busy={busy}
      isLoading={isLoading}
    >
      <div className="mx-auto mt-5 mb-16 max-w-[1040px] px-5 sm:mb-20 sm:mt-10">
        <div className="flex justify-between">
          <h1>ショッピングカート</h1>
          <Link to={`/products`}>買い物を続ける</Link>
        </div>
        <div className="mx-auto mt-8 flex max-w-[800px] flex-col gap-5 border-b border-slate-300 pb-4 sm:pb-2">
          {cartState?.map((item, index) => (
            <div
              key={index}
              className="grid grid-flow-row-dense grid-cols-3 grid-rows-2 items-center gap-[4%] sm:grid-cols-5 sm:grid-rows-1 md:gap-10"
            >
              <Link
                to={`/product/${item.merchandise.product.handle}`}
                className="col-span-1 row-span-2 sm:col-span-1 sm:row-span-1"
              >
                <img
                  src={
                    item.merchandise.product.featuredImage
                      ?.url
                  }
                  alt=""
                />
              </Link>
              <div className="col-span-2 self-end sm:col-span-2 sm:self-center">
                <Link
                  to={`/product/${item.merchandise.product.handle}`}
                >
                  {item.merchandise.product.title}
                </Link>
                <p className="text-xs text-slate-400">
                  ¥
                  {price(
                    item.merchandise.product.variants
                      .edges[0].node.priceV2.amount,
                  )}{" "}
                  +tax
                </p>
              </div>
              <div className="self-start sm:col-end-5 sm:self-center">
                <div className="flex w-[100px] items-center border border-slate-300">
                  <Form method="post">
                    <input
                      type="hidden"
                      name="quantity"
                      value={item.quantity}
                    />
                    <input
                      type="hidden"
                      name="id"
                      value={item.id}
                    />
                    <button
                      className="p-3 sm:py-5"
                      onClick={() => {
                        setCartState(
                          cartState?.map((q, i) =>
                            i === index
                              ? {
                                  ...q,
                                  quantity: q.quantity - 1,
                                }
                              : q,
                          ),
                        );
                      }}
                      type="submit"
                    >
                      -
                    </button>
                  </Form>
                  <p className="w-8 text-center">
                    {item.quantity}
                  </p>
                  <Form method="post">
                    <input
                      type="hidden"
                      name="quantity"
                      value={item.quantity}
                    />
                    <input
                      type="hidden"
                      name="id"
                      value={item.id}
                    />

                    <button
                      className="p-3 sm:py-5"
                      onClick={() => {
                        setCartState(
                          cartState?.map((q, i) =>
                            i === index
                              ? {
                                  ...q,
                                  quantity: q.quantity + 1,
                                }
                              : q,
                          ),
                        );
                      }}
                      type="submit"
                    >
                      +
                    </button>
                  </Form>
                </div>
              </div>
              <p className="self-start py-3 sm:col-end-6 sm:self-center sm:justify-self-end">
                ¥
                {price(
                  String(
                    item.merchandise.product.variants
                      .edges[0].node.priceV2.amount *
                      item.quantity,
                  ),
                )}
                <span className="ml-1 text-xs">+tax</span>
              </p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-2 mb-5 flex max-w-[800px] items-center justify-center gap-5 sm:items-end sm:justify-end sm:gap-10">
          <p className="text-base sm:text-sm">
            合計金額(税込)
          </p>
          <div className="relative max-w-[100px] text-base sm:text-xl">
            <p className={busy && "text-transparent"}>
              ¥
              {price(
                cart?.estimatedCost.totalAmount.amount,
              )}
            </p>
            {busy && (
              <AiOutlineLoading3Quarters className="absolute inset-0 m-auto h-5 w-5 animate-spin" />
            )}
          </div>
        </div>
        <div className="mx-auto max-w-[800px] sm:flex sm:justify-end">
          <div>
            <a
              href={cart?.checkoutUrl}
              className="block w-full border border-slate-800 py-5 text-center transition-all hover:border-transparent hover:bg-slate-800
            hover:text-white sm:inline-block sm:px-10"
            >
              ご購入手続きへ
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Cart;
