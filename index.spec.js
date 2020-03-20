const remark = require("remark");
const remarkImageAttributes = require("./index");

const noAttributes = [
  "![](https://image.com/123.png)",
  "![imageAlt](https://image.com/123.png)",
  '![imageAlt](https://image.com/123.png "imageTitle")'
];

const withAttributes = ["![](https://image.com/)"];

describe("remark-image-attributes", () => {
  it("ignores images without attributes", () => {
    noAttributes.forEach(mdImage => {
      const parsed = remark()
        .use(remarkImageAttributes)
        .processSync(mdImage);
      console.log(parsed);
    });
  });
  it.only("finds images with urls", () => {
    const parsed = remark()
      .use(remarkImageAttributes)
      .processSync("![imageAlt](https://image.com/123.png width=100,zoom=true)")
      .toString();
    console.log(parsed);
  });
});
