import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import type { VFC } from "react";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import type { ProductsQuery } from "~/graphql/shopify/generated";
import { ProductsDocument } from "~/graphql/shopify/generated";
import { shopifyResolver } from "~/graphql/shopify/resolver";
import { price } from "~/utils/price";

// ここまで
//
//
//
// ここから

export const loader: LoaderFunction = async () => {
  const { data } = await shopifyResolver(
    ProductsDocument.loc?.source.body,
    { first: 8 },
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

  return (
    <>
      <Header />

      <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-4 px-[4%] pt-20 md:grid-cols-4 md:gap-7 md:px-5">
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

      <Footer />
    </>
  );
};
export default Index;
