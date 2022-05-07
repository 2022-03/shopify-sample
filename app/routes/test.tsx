import { Form } from "@remix-run/react";
import type { VFC } from "react";
import { useState } from "react";

const items = [
  { a: 1, b: 2 },
  { a: 1, b: 2 },
  { a: 1, b: 2 },
];

const Test: VFC = () => {
  const [itemsState, setItemsState] = useState(items);
  return (
    <>
      {itemsState.map((item, index) => (
        <div key={index}>
          <p>{item.a}</p>
          <p>{item.b}</p>
          <Form method="post">
            <button
              onClick={() =>
                setItemsState(
                  itemsState.map((q, i) =>
                    i === index
                      ? {
                          ...q,
                          a: q.a + 1,
                        }
                      : q,
                  ),
                )
              }
              name="_action"
              value="incremental"
            >
              プラス
            </button>
            <button
              onClick={() =>
                setItemsState(
                  itemsState.map((q, i) =>
                    i === index
                      ? {
                          ...q,
                          a: q.a - 1,
                        }
                      : q,
                  ),
                )
              }
            >
              マイナス
            </button>
          </Form>
        </div>
      ))}
    </>
  );
};
export default Test;
