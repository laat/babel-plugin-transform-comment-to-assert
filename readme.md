# babel-plugin-transform-comment-to-assert
[![Build Status][travis-image]][travis-url] [![npm][npm-image]][npm-url]
[npm-image]: https://img.shields.io/npm/v/babel-plugin-transform-comment-to-assert.svg?style=flat
[npm-url]: https://npmjs.org/package/babel-plugin-transform-comment-to-assert
[travis-image]: https://travis-ci.org/laat/babel-plugin-transform-comment-to-assert.svg?branch=master
[travis-url]: https://travis-ci.org/laat/babel-plugin-transform-comment-to-assert

> replace commented expressions with assert statements

## Install

```
$ npm install --save babel-plugin-transform-comment-to-assert
```

## Usage

```javascript
import visitor from 'babel-plugin-transform-comment-to-assert'
import traverse from 'babel-traverse'
import generate from 'babel-generator'
import { transform } from 'babel-core'

function replace (code) {
  const { ast } = transform(code)
  traverse(ast, visitor().visitor)
  return generate(ast, {}, code).code.trim()
}

replace('1 //=> 1')
//=> 'assert.deepEqual(1, 1);'

```

Objects:

```javascript

replace('a = { a: 1 }; a //=> {a: 1}')
//=> 'a = { a: 1 };assert.deepEqual(a, { a: 1 });'
```

Results of function calls:

```javascript
replace("(() => 'foo')() //=> 'bar'")
//=> "assert.deepEqual((() => 'foo')(), 'bar');"
```

It also supports `console.log`:

```javascript
replace("console.log('foo') //=> 'bar'")
//=> "console.log('foo'); //=> 'bar'\n\nassert.deepEqual('foo', 'bar');"
```

Throws:

```javascript
replace(`
const a = () => {
  throw new Error('fail');
};
a() // throws Error
`);
/*=>
`const a = () => {
  throw new Error('fail');
};
assert.throws(() => {
  a();
}, Error);`
*/
```

```javascript
replace(`
const a = () => {
  throw new Error('fail');
};
a() // throws /fail/
`);
/*=>
`const a = () => {
  throw new Error('fail');
};
assert.throws(() => {
  a();
}, /fail/);`
*/
```
## License

MIT © [Sigurd Fosseng](https://github.com/laat)
