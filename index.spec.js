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
    const parsed = parse(
      "![](../images/no_string.svg border-radius=9999px,border-color=#fff)"
    );
    expect(parsed).toEqual(
      wrapInRoot({
        type: "image",
        alt: null,
        title: null,
        url: "../images/no_string.svg",
        attributes: {
          "border-radius": "9999px",
          "border-color": "#fff"
        }
      })
    );
  });

  it("doesn't rely on image file extensions", () => {
    const parsed = parse(
      "![fromUrl](https://imgur.com/SXODL1L width=100px,background=#eaeaea)"
    );
    expect(parsed).toEqual(
      wrapInRoot({
        type: "image",
        alt: "fromUrl",
        title: "fromUrl",
        url: "https://imgur.com/SXODL1L",
        attributes: {
          width: "100px",
          background: "#eaeaea"
        }
      })
    );
  });

  it("doesn't choke on ) being the last character", () => {
    const parsed = parse(
      "![rotated](~/images/rotated@myAlbum.tiff transform=rotate(-90 deg))"
    );
    expect(parsed).toEqual(
      wrapInRoot({
        type: "image",
        alt: "rotated",
        title: "rotated",
        url: "~/images/rotated@myAlbum.tiff",
        attributes: {
          transform: "rotate(-90 deg)"
        }
      })
    );
  });

  it("finds image urls with query parameters", () => {
    const parsed = parse(
      "![queryParams](https://images.pexels.com/photos/2090903/pexels-photo-2090903.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260 width=1260,height=740)"
    );

    expect(parsed).toEqual(
      wrapInRoot({
        type: "image",
        alt: "queryParams",
        title: "queryParams",
        url:
          "https://images.pexels.com/photos/2090903/pexels-photo-2090903.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260",
        attributes: {
          width: "1260",
          height: "740"
        }
      })
    );
  });
});
