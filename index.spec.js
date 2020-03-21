const remark = require("remark");
const remarkParser = require("remark-parse");
const remarkImageAttributes = require("./index");

const wrapInRoot = expectedNode => ({
  type: "root",
  children: [expectedNode]
});

const parse = input =>
  remark()
    .use(remarkParser, { position: false })
    .use(remarkImageAttributes)
    .parse(input);

describe("remark-image-attributes", () => {
  it("ignores images without attributes", () => {
    const parsed = parse("![imageAlt](https://image.com/123.png)");
    expect(parsed.children[0].type).toBe("paragraph");
  });

  it("finds images with urls", () => {
    const parsed = parse(
      "![imageAlt](https://image.com/123.png width=100,box-shadow=0px 1px 10px)"
    );
    expect(parsed).toEqual(
      wrapInRoot({
        type: "image",
        alt: "imageAlt",
        title: "imageAlt",
        url: "https://image.com/123.png",
        attributes: {
          width: "100",
          "box-shadow": "0px 1px 10px"
        }
      })
    );
  });

  it("finds images with relative paths", () => {
    const parsed = parse(
      "![imageAlt](../images/foo-123.jpg width=200px,height=100px)"
    );
    expect(parsed).toEqual(
      wrapInRoot({
        type: "image",
        alt: "imageAlt",
        title: "imageAlt",
        url: "../images/foo-123.jpg",
        attributes: {
          width: "200px",
          height: "100px"
        }
      })
    );
  });

  it("finds images without alt string", () => {
    const parsed = parse("![](../images/no_string.svg border-radius=9999px,border-color=#fff)");
    expect(parsed).toEqual(
      wrapInRoot({
        type: "image",
        alt: null,
        title: null,
        url: "../images/no_string.svg",
        attributes: {
          'border-radius': "9999px",
          'border-color': "#fff"
        }
      })
    );
  });
});
