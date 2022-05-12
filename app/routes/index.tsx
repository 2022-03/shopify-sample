import type {
  LinksFunction,
  LoaderFunction,
} from "@remix-run/cloudflare";
import {
  Link,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { VFC } from "react";
import type { Settings } from "react-slick";
import Slider from "react-slick";
import slickTheme from "slick-carousel/slick/slick-theme.css";
import slick from "slick-carousel/slick/slick.css";
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

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: slick },
    { rel: "stylesheet", href: slickTheme },
  ];
};

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

  // ここまで
  //
  //
  //
  // ここから

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

  // ここまで
  //
  //
  //
  // ここから

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

const Index: VFC = () => {
  const { products } = useLoaderData() as ProductsQuery;
  const { quantity } = useLoaderData();
  const transition = useTransition();
  const busy = transition.submission;
  const isLoading =
    !busy && transition.state === "loading" ? true : false;

  const settings: Settings = {
    infinite: true,
    speed: 2000,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
  };

  return (
    <>
      <ul className="overflow-hidden">
        <Slider {...settings}>
          {products.nodes.slice(1, 5).map((image) => (
            <li key={image.handle}>
              <img
                src={image.images.nodes[0].url}
                alt=""
                className="h-screen w-full object-cover"
              />
            </li>
          ))}
        </Slider>
      </ul>
      <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-4 px-[4%] md:grid-cols-4 md:gap-7 md:px-5">
        {products.nodes.slice(0, 8).map((product) => (
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
                  product.variants.nodes[0].priceV2.amount,
                )}{" "}
                +tax
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="my-10 text-center md:mb-20">
        <Link to={`/products`} className="capitalize">
          to products page
        </Link>
      </div>
    </>
  );
};
export default Index;
