const attributeImageExp = /^\!\[(.*)?\]\((.+?)#(.+?)\)$/;
const fenceStart = '![';
const fenceEnd = ')';

const inlineLocator = (value, fromIndex) => {
  return value.indexOf(fenceStart, fromIndex);
};

const imageAttributesTokenizer = (eat, value, silent) => {
  if (!value.startsWith(fenceStart)) return false;

  const nextStart = value.indexOf(fenceStart, 1);
  const fenceEndPosition = value.lastIndexOf(
    fenceEnd,
    nextStart !== -1 ? nextStart : undefined
  );
  if (fenceEndPosition === -1) return false;

  const endPosition = fenceEndPosition + fenceEnd.length;
  const imageWithAttributes = value.slice(0, endPosition);
  const parsedImageAttributes = parseImageAttribute(imageWithAttributes);

  if (!parsedImageAttributes) return false;
  if (silent) return true;

  const node = eat(imageWithAttributes)({
    type: 'image',
    ...parsedImageAttributes
  });

  node.inline = endPosition !== value.length || node.position.start.column > 1;

  return node;
};

const parseImageAttribute = imageWithAttributes => {
  const [, alt, url, attributesString] =
    imageWithAttributes.match(attributeImageExp) || [];

  if (!attributesString) return;

  const attributes = attributesString.split(';').reduce((attrs, attr) => {
    const [key, val] = attr.split('=');
    if (!val || !key) return attrs;
    return {
      ...attrs,
      [key]: val
    };
  }, {});

  return {
    alt: alt || null,
    title: alt || null,
    url,
    attributes
  };
};

const imageAttributesCompiler = node =>
  `${fenceStart}${node.alt || ''}](${node.url}${fenceEnd}`;

const isRemarkParser = parser =>
  Boolean(parser?.prototype?.inlineTokenizers?.break?.locator);

const isRemarkCompiler = compiler => Boolean(compiler?.prototype?.visitors);

function imageAttributes() {
  if (isRemarkParser(this.Parser)) {
    const parser = this.Parser.prototype;
    const tokenizers = parser.inlineTokenizers;
    const methods = parser.inlineMethods;

    tokenizers.imageAttributes = imageAttributesTokenizer;
    methods.splice(methods.indexOf('html'), 0, 'imageAttributes');
  }
  if (isRemarkCompiler(this.Compiler)) {
    this.Compiler.prototype.visitors.imageAttributes = imageAttributesCompiler;
  }

  imageAttributesTokenizer.locator = inlineLocator;
}

module.exports = imageAttributes;
