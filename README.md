# remark-image-attributes

Parses markdown for images with attributes and puts those attributes on an `image` markdownAST node in the field `attributes`. Since this parser has been written to feed styles to [gatsby-remark-image-attributes](https://github.com/rbeer/gatsby-remark-image-attributes.git), the examples revolve around CSS-styles; yet the parser does not care about the keys nor values, as long as the `key=value;` format is met.

## Installation

```bash
npm install --save remark-image-attributes
```

## How to use

_Run this example with `npm run example`_

Have an .md file with some images:

```md
Add style attributes to the image

![some oranges](https://images.pexels.com/photos/2090903/pexels-photo-2090903.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260#width=1260;height=740)

You don't need an alt text

![](https://images.pexels.com/photos/3104856/pexels-photo-3104856.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260#box-shadow=0 1px 5px 5px;border-radius=50%;border-color=rgb(120,120,120))

Put your image wherever you want

Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at ![happy](https://images.pexels.com/photos/2728493/pexels-photo-2728493.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940#width=200px;float=right) Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32
```

Have it parsed or processed by remark, using this plugin:

```js
const vfile = require("to-vfile");
const remark = require("remark");
const remarkParser = require("remark-parse");
const remarkImageAttributes = require("../index.js");
const visit = require("unist-util-visit");

const markdown = vfile.readSync(`${__dirname}/example.md`);

const markdownAST = remark()
  .use(remarkParser, { position: false })
  .use(remarkImageAttributes)
  .parse(markdown);

visit(markdownAST, "image", node => console.log(node));
```

Get these 'image' type nodes:

```js
{
  type: 'image',
  alt: 'some oranges',
  title: 'some oranges',
  url: 'https://images.pexels.com/photos/2090903/pexels-photo-2090903.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
  attributes: { width: '1260', height: '740' }
},
{
  type: 'image',
  alt: null,
  title: null,
  url: 'https://images.pexels.com/photos/3104856/pexels-photo-3104856.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
  attributes: {
    'box-shadow': '0 1px 5px 5px',
    'border-radius': '50%',
    'border-color': 'rgb(120,120,120)'
  }
},
{
  type: 'image',
  alt: 'happy',
  title: 'happy',
  url: 'https://images.pexels.com/photos/2728493/pexels-photo-2728493.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  attributes: { width: '200px', float: 'right' }
}
```

## Caveats/ToDo

- The plugin doesn't recognize the title syntax, rather copies the [alt] to the `title` field.
  ```md
  ![altText](https://image.com/foo.png width=100)
  ```
  results in
  ```js
  {
    type: 'image',
    ...,
    alt: 'altText',
    title: 'altText'
  }
  ```
