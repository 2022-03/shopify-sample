import type {
  ActionFunction,
  LoaderFunction,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import {
  Form,
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
    return { quantity: 0 };
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

export const action: ActionFunction = async ({
  request,
}) => {
  const formData = await request.formData();
  const value = Object.fromEntries(formData);
  const { name, email, message } = value;

  const data = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: USER_ID,
    accessToken: ACCESS_TOKEN,
    template_params: {
      name,
      email,
      message,
    },
  };

  await fetch(
    "https://api.emailjs.com/api/v1.0/email/send",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  ).then(
    (result) => {
      console.log(result.statusText);
    },
    (error) => {
      console.log(error.statusText);
    },
  );

  return redirect("/completionScreen");
};

// ここまで
//
//
//
// ここから

const Contact: VFC = () => {
  const { quantity } = useLoaderData();

  const transition = useTransition();
  const isLoading =
    transition.state === "loading" ? true : false;

  return (
    <Layout quantity={quantity} isLoading={isLoading}>
      <div className="max-w-[1040px] px-[4%] md:px-5">
        <h1 className="mx-auto max-w-[800px] py-5 capitalize">
          お問い合せ
        </h1>
        <Form
          method="post"
          className="mx-auto max-w-[800px]"
        >
          <div className="mb-10 grid grid-rows-4 gap-y-5 md:flex md:flex-row md:flex-wrap md:gap-x-3">
            <input
              type="text"
              name="name"
              placeholder="名前"
              className="border p-3 md:basis-[calc(50%_-_6px)]"
            />
            <input
              type="email"
              name="email"
              placeholder="メール *"
              required
              className="border p-3 md:basis-[calc(50%_-_6px)]"
            />
            <textarea
              name="message"
              placeholder="お問い合わせ内容"
              className="row-span-2 border p-3 md:h-40 md:basis-full"
            />
          </div>
          <button
            className="w-full border border-slate-800 py-5 transition-all hover:border-transparent
          hover:bg-slate-800 hover:text-white md:w-40"
            type="submit"
          >
            送信
          </button>
        </Form>
      </div>
    </Layout>
  );
};
export default Contact;
