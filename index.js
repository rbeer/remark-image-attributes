module.exports = imageAttributes;

const attributeImageExp = /^\!\[(.*)?\]\((.+?) ([\w\s\d()-=.,]+)\)/

function imageAttributes(options) {
  const startBlock = "![";
  const endBlock = ")";
  const inlineMode = (options || {}).inlineMode || false;

  if (isRemarkParser(this.Parser)) {
    const parser = this.Parser.prototype;
    const tokenizers = inlineMode
      ? parser.inlineTokenizers
      : parser.blockTokenizers;
    const methods = inlineMode ? parser.inlineMethods : parser.blockMethods;

    tokenizers.imageAttributes = imageAttributesTokenizer;
    methods.splice(methods.indexOf("html"), 0, "imageAttributes");
  }
  if (isRemarkCompiler(this.Compiler)) {
    const compiler = this.Compiler.prototype;
    compiler.visitors.imageAttributes = imageAttributesCompiler;
  }

  function locator(value, fromIndex) {
    return value.indexOf(startBlock, fromIndex);
  }

  function imageAttributesTokenizer(eat, value) {
    if (!value.startsWith(startBlock)) return;

    const endBlockPosition = value.indexOf(endBlock, startBlock.length);
    if (endBlockPosition === -1) return;

    const endPosition = endBlockPosition + endBlock.length;
    const imageWithAttributes = value.slice(0, endPosition);

    const parsedImageAttributes = parseImageAttribute(imageWithAttributes);

    if (!parsedImageAttributes) return;

    return eat(imageWithAttributes)({
      type: "image",
      ...parsedImageAttributes
    });
  }
  imageAttributesTokenizer.locator = locator;

  function imageAttributesCompiler(node) {
    const attributeKeys = Object.keys(node.attributes);
    const attributesString = attributeKeys.reduce((attrsString, attrKey) => {
      return `${attrsString},${attrKey}=${node.attributes[attrKey]}`;
    }, "");
    const alt = node.alt || "";
    const title = node.title || "";
    return `${startBlock}${alt}](${node.url}${endBlock}`;
  }
}

function parseImageAttribute(imageWithAttributes) {
  const parts = imageWithAttributes.match(attributeImageExp);
  if (!parts) return;

  const alt = parts[1];
  const url = parts[2];
  const attributesString = parts[3];

  if (!attributesString) return;

  const attributes = attributesString.split(",").reduce((attrs, attr) => {
    const [key, val] = attr.split("=");
    if (!val || !key) return attrs;
    return {
      ...attrs,
      [key]: val
    };
  }, {});

  return {
    alt: alt || null,
    url,
    attributes
  };
}

function isRemarkParser(parser) {
  return Boolean(
    parser &&
      parser.prototype &&
      parser.prototype.inlineTokenizers &&
      parser.prototype.inlineTokenizers.break &&
      parser.prototype.inlineTokenizers.break.locator
  );
}

function isRemarkCompiler(compiler) {
  return Boolean(compiler && compiler.prototype);
}
