#!/usr/bin/env node

const vfile = require('to-vfile');
const remark = require('remark');
const remarkParser = require('remark-parse');
const remarkImageAttributes = require('../index.js');
const visit = require('unist-util-visit');

console.log('Reading ./markdown.md');
const markdown = vfile.readSync(`${__dirname}/example.md`);

console.log('Parsing');
const markdownAST = remark()
  .use(remarkParser, { position: false })
  .use(remarkImageAttributes)
  .parse(markdown);

visit(markdownAST, 'image', (node) => console.log(node));
