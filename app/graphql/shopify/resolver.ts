export const shopifyResolver = async (
  schema: any,
  argument?: any,
) => {
  const { data }: { data: any } = await fetch(
    SHOPIFY_ENDPOINT,
    {
      method: "POST",
      headers: {
        "X-Shopify-Storefront-Access-Token":
          SHOPIFY_STOREFRONT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: schema,
        variables: argument,
      }),
    },
  ).then((res) => res.json());

  return { data };
};
