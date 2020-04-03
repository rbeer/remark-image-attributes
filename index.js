const attributeImageExp = /^\!\[(.*)?\]\((.+?)#(.+?\)?)\)/;
const fenceStart = "![";
const fenceEnd = ")";

const inlineLocator = (value, fromIndex) => {
  return value.indexOf(fenceStart, fromIndex);
};

const imageAttributesTokenizer = (eat, value) => {
  if (!value.startsWith(fenceStart)) return;

  const fenceEndPosition = value.lastIndexOf(fenceEnd);
  if (fenceEndPosition === -1) return;

  const endPosition = fenceEndPosition + fenceEnd.length;
  const imageWithAttributes = value.slice(0, endPosition);
  const parsedImageAttributes = parseImageAttribute(imageWithAttributes);

  if (!parsedImageAttributes) return;

  return eat(imageWithAttributes)({
    type: "image",
    ...parsedImageAttributes,
  });
};

const imageAttributesCompiler = (node) =>
  `${fenceStart}${node.alt || ""}](${node.url}${fenceEnd}`;

const parseImageAttribute = (imageWithAttributes) => {
  const [, alt, url, attributesString] =
    imageWithAttributes.match(attributeImageExp) || [];

  if (!attributesString) return;

  const attributes = attributesString.split(";").reduce((attrs, attr) => {
    const [key, val] = attr.split("=");
    if (!val || !key) return attrs;
    return {
      ...attrs,
      [key]: val,
    };
  }, {});

  return {
    alt: alt || null,
    title: alt || null,
    url,
    attributes,
  };
};

const isRemarkParser = (parser) =>
  Boolean(
    parser &&
      parser.prototype &&
      parser.prototype.inlineTokenizers &&
      parser.prototype.inlineTokenizers.break &&
      parser.prototype.inlineTokenizers.break.locator
  );

const isRemarkCompiler = (compiler) => Boolean(compiler && compiler.prototype);

function imageAttributes() {
  if (isRemarkParser(this.Parser)) {
    const parser = this.Parser.prototype;
    const tokenizers = parser.inlineTokenizers;
    const methods = parser.inlineMethods;

    tokenizers.imageAttributes = imageAttributesTokenizer;
    methods.splice(methods.indexOf("html"), 0, "imageAttributes");
  }
  if (isRemarkCompiler(this.Compiler)) {
    this.Compiler.prototype.visitors.imageAttributes = imageAttributesCompiler;
  }

  imageAttributesTokenizer.locator = inlineLocator;
}

module.exports = imageAttributes;
