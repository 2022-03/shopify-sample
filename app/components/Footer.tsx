import type { VFC } from "react";
import { memo } from "react";

// ここまで
//
//
//
// ここから

const linkItems = [
  { name: "instagram", url: "https://www.instagram.com" },
  { name: "twitter", url: "https://twitter.com" },
  { name: "facebook", url: "https://www.facebook.com" },
];

// ここまで
//
//
//
// ここから

export const Footer: VFC = memo(() => {
  return (
    <>
      <footer className="mx-auto mb-5 flex max-w-[1040px] flex-col items-center gap-4 px-[4%] md:flex-row md:justify-between md:gap-0 md:px-5">
        <div className="flex gap-5">
          {linkItems.map((item) => (
            <a
              href={`${item.url}`}
              key={item.name}
              className="capitalize"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div>
          <img
            src="images/copyright.svg"
            alt=""
            className="h-3"
          />
        </div>
      </footer>
    </>
  );
});
Footer.displayName = "Footer";
