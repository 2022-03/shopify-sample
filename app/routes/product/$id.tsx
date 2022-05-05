import type { VFC } from "react";
import { Layout } from "~/components/Layout";

const Product: VFC = () => {
  return (
    <Layout quantity={1}>
      <h1>商品ページ</h1>
    </Layout>
  );
};
export default Product;
