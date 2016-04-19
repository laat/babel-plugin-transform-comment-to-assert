/* global describe, it */
import commentVisitor from './index.js';
import traverse from 'babel-traverse';
import generate from 'babel-generator';
import { transform } from 'babel-core';
import { expect } from 'chai';

function testGeneration(code, expectedCode) {
  const { ast } = transform(code);
  traverse(ast, commentVisitor().visitor);
  const transformedCode = generate(ast, {}, code).code;
  expect(transformedCode.trim()).to.equal(expectedCode.trim());
}

describe('Babel comment assert equal', () => {
  it('should add string asserts', () => {
    testGeneration(`
a = "foobar"
a //=> "foobar"
`, `
a = "foobar";
assert.deepEqual(a, "foobar");
`);
  });

  it('should add number asserts', () => {
    testGeneration(`
a = 1;
a //=> 1
`, `
a = 1;
assert.deepEqual(a, 1);
`);
  });

  it('should add Array asserts', () => {
    testGeneration(`
a = [1, 2, 3];
a //=> [1, 2, 3]
`, `
a = [1, 2, 3];
assert.deepEqual(a, [1, 2, 3]);
`);
  });

  it('should add Object asserts', () => {
    testGeneration(`
a = { "a": 1 }
a //=> {a: 1}
`, `
a = { "a": 1 };
assert.deepEqual(a, { a: 1 });
`);
  });

  it('should add console.log asserts', () => {
    testGeneration(`
a = { "a": 1 }
console.log(a) //=> {a: 1}
`, `
a = { "a": 1 };
console.log(a);assert.deepEqual(a, { a: 1 });
`);
  });
  it('should add functioncall asserts', () => {
    testGeneration(`
a = { "a": 1 }
foobar(a) //=> {a: 1}
`, `
a = { "a": 1 };
assert.deepEqual(foobar(a), { a: 1 });
`);
  });

  it('should add Object property asserts', () => {
    testGeneration(`
a = { "foo": 1 }
a.foo //=> 1
`, `
a = { "foo": 1 };
assert.deepEqual(a.foo, 1);
`);
  });
});
