import type { LoaderFunction } from "@remix-run/cloudflare";
import {
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { VFC } from "react";
import { Layout } from "~/components/Layout";
import { cartQuantity } from "~/utils/cartQuantity";
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

  const { quantity } = await cartQuantity(cookie.cartId);
  return { quantity };
};

// ここまで
//
//
//
// ここから

const items = [
  {
    title: "社名",
    value: ["株式会社ファニチャーデザイン"],
  },
  {
    title: "住所",
    value: ["〒107-0062 東京都港区南青山１丁目××××××"],
  },
  { title: "設立", value: ["XXXX年XX月"] },
  { title: "資本金", value: ["XXXX万円"] },
  { title: "従業員数", value: ["XX名"] },
  {
    title: "事業内容",
    value: [
      "家具、インテリアの企画・生産",
      "家具、インテリアの販売",
      "店舗の企画・デザイン・設計",
    ],
  },
];

// ここまで
//
//
//
// ここから

const Company: VFC = () => {
  const { quantity } = useLoaderData();

  const transition = useTransition();
  const isLoading =
    transition.state === "loading" ? true : false;

  return (
    <Layout quantity={quantity} isLoading={isLoading}>
      <div className="mx-auto max-w-[1040px] px-5 pt-5">
        <h1 className="pb-3 capitalize">company</h1>
        <table className="mx-auto mb-5 md:mx-0 md:mb-10">
          <tbody>
            {items.map((item) => (
              <tr
                key={item.title}
                className="flex flex-col gap-2 border-b py-3 last-of-type:border-none md:table-row"
              >
                <td
                  className="px-2 md:px-5 md:py-3"
                  valign="top"
                >
                  {item.title}
                </td>
                <td className="px-2 md:px-5 md:py-3">
                  {item.value.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mb-20 h-[400px] max-w-[600px] grayscale">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.7479446765833!2d139.7432565503818!3d35.658581238724935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b972148d72f%3A0x1312431bf75c7130!2z44CSMTA1LTAwMTEg5p2x5Lqs6YO95riv5Yy66Iqd5YWs5ZyS77yU5LiB55uu77yS4oiS77yY!5e0!3m2!1sja!2sjp!4v1652275432034!5m2!1sja!2sjp"
            title="map"
            className="h-full w-full"
          />
        </div>
      </div>
    </Layout>
  );
};
export default Company;
