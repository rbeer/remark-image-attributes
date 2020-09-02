const remark = require('remark');
const remarkParser = require('remark-parse');
const visit = require('unist-util-visit');
const selectAll = require('unist-util-select').selectAll;
const remarkImageAttributes = require('./index');

const parse = input =>
  remark()
    .use(remarkParser, { position: false })
    .use(remarkImageAttributes)
    .parse(input);

const visitWithExpectation = (parsed, expected) =>
  visit(parsed, 'image', node => expect(node).toEqual(expected));

const selectWithExpectation = (parsed, expected, selector = 'image') =>
  expect(selectAll(selector, parsed)).toEqual(expected);

describe('remark-image-attributes', () => {
  it('ignores images without attributes', () => {
    const parsed = parse('![imageAlt](https://image.com/123.png)');
    visit(parsed, 'image', node =>
      expect(node).not.toHaveProperty('attributes')
    );
  });

  it('finds images with urls', () => {
    const parsed = parse(
      '![imageAlt](https://image.com/123.png#width=100;box-shadow=0px 1px 10px)'
    );

    visitWithExpectation(parsed, {
      type: 'image',
      alt: 'imageAlt',
      title: 'imageAlt',
      url: 'https://image.com/123.png',
      attributes: {
        width: '100',
        'box-shadow': '0px 1px 10px'
      }
    });
  });

  it('finds images with relative paths', () => {
    const parsed = parse(
      '![imageAlt](../images/foo-123.jpg#width=200px;height=100px)'
    );
    visitWithExpectation(parsed, {
      type: 'image',
      alt: 'imageAlt',
      title: 'imageAlt',
      url: '../images/foo-123.jpg',
      attributes: {
        width: '200px',
        height: '100px'
      }
    });
  });

  it('finds images without alt string', () => {
    const parsed = parse(
      '![](../images/no_string.svg#border-radius=9999px;border-color=#fff)'
    );
    visitWithExpectation(parsed, {
      type: 'image',
      alt: null,
      title: null,
      url: '../images/no_string.svg',
      attributes: {
        'border-radius': '9999px',
        'border-color': '#fff'
      }
    });
  });

  it('finds inline images', () => {
    const parsed = parse(
      'This is a paragraph with an inline ![](../images/no_string.svg#border-radius=9999px;border-color=#fff;filter=rotate(42deg) foo(bar) baz(3.2px)) image'
    );
    visitWithExpectation(parsed, {
      type: 'image',
      alt: null,
      title: null,
      url: '../images/no_string.svg',
      attributes: {
        'border-radius': '9999px',
        'border-color': '#fff',
        filter: 'rotate(42deg) foo(bar) baz(3.2px)'
      }
    });
  });

  it('finds multiple inline images', () => {
    const parsed = parse(
      'This is a paragraph with several ![](../images/first.svg#border-radius=9999px;border-color=#fff;filter=rotate(42deg) foo(bar) baz(3.2px)) inline ![](../images/second.svg#border-radius=99px;border-color=#000) images ![](../images/third.svg)'
    );
    selectWithExpectation(parsed, [
      {
        type: 'image',
        alt: null,
        title: null,
        url: '../images/first.svg',
        attributes: {
          'border-radius': '9999px',
          'border-color': '#fff',
          filter: 'rotate(42deg) foo(bar) baz(3.2px)'
        }
      },
      {
        type: 'image',
        alt: null,
        title: null,
        url: '../images/second.svg',
        attributes: {
          'border-radius': '99px',
          'border-color': '#000'
        }
      },
      {
        type: 'image',
        alt: null,
        title: null,
        url: '../images/third.svg'
      }
    ]);
  });

  it("doesn't rely on image file extensions", () => {
    const parsed = parse(
      '![fromUrl](https://imgur.com/SXODL1L#width=100px;background=#eaeaea)'
    );
    visitWithExpectation(parsed, {
      type: 'image',
      alt: 'fromUrl',
      title: 'fromUrl',
      url: 'https://imgur.com/SXODL1L',
      attributes: {
        width: '100px',
        background: '#eaeaea'
      }
    });
  });

  it("doesn't choke on ) being the last character", () => {
    const parsed = parse(
      '![rotated](~/images/rotated@myAlbum.tiff#transform=rotate(-90 deg))'
    );
    visitWithExpectation(parsed, {
      type: 'image',
      alt: 'rotated',
      title: 'rotated',
      url: '~/images/rotated@myAlbum.tiff',
      attributes: {
        transform: 'rotate(-90 deg)'
      }
    });
  });

  it('reads until the last )', () => {
    const parsed = parse(
      '![filtered](./logo.svg#filter=hue-rotate(-282deg) brightness(1.5) drop-shadow(2px 4px 6px black);width=100px)'
    );
    visitWithExpectation(parsed, {
      type: 'image',
      alt: 'filtered',
      title: 'filtered',
      url: './logo.svg',
      attributes: {
        filter:
          'hue-rotate(-282deg) brightness(1.5) drop-shadow(2px 4px 6px black)',
        width: '100px'
      }
    });
  });

  it("doesn't trip over values with spaces", () => {
    const parsed = parse(
      'some ![gatsby](./gatsby-logo.png#width=10px;key=value with spaces) inline ![gatsby](./gatsby-logo.png#width=10px;key=value with spaces) madness ![gatsby](./gatsby-logo.png#width=10px;key=value with spaces)'
    );
    selectWithExpectation(parsed, [
      {
        type: 'image',
        alt: 'gatsby',
        title: 'gatsby',
        url: './gatsby-logo.png',
        attributes: {
          key: 'value with spaces',
          width: '10px'
        }
      },
      {
        type: 'image',
        alt: 'gatsby',
        title: 'gatsby',
        url: './gatsby-logo.png',
        attributes: {
          key: 'value with spaces',
          width: '10px'
        }
      },
      {
        type: 'image',
        alt: 'gatsby',
        title: 'gatsby',
        url: './gatsby-logo.png',
        attributes: {
          key: 'value with spaces',
          width: '10px'
        }
      }
    ]);
  });

  it('finds image urls with query parameters', () => {
    const parsed = parse(
      '![queryParams](https://images.pexels.com/photos/2090903/pexels-photo-2090903.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260#width=1260;height=740)'
    );

    visitWithExpectation(parsed, {
      type: 'image',
      alt: 'queryParams',
      title: 'queryParams',
      url:
        'https://images.pexels.com/photos/2090903/pexels-photo-2090903.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
      attributes: {
        width: '1260',
        height: '740'
      }
    });
  });

  it("doesn't trip over attribute pattern in URL", () => {
    const parsed =
      '![](https://image.com/123.bmp?key=value;another=one#width=100vh;foo=bar)';

    visitWithExpectation(parsed, {
      type: 'image',
      alt: null,
      title: null,
      url: 'https://image.com/123.bmp?key=value,another=one',
      attributes: {
        width: '100px',
        foo: 'bar'
      }
    });
  });
});
