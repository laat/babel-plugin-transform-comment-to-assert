import commentVisitor from './index.js';
import traverse from 'babel-traverse';
import generate from 'babel-generator';
import { transform } from 'babel-core';
import assert from 'assert-simple-tap';

const testGeneration = (code, expectedCode, message) => {
  const { ast } = transform(code);
  traverse(ast, commentVisitor().visitor);
  const transformedCode = generate(ast, {}, code).code;
  assert.equal(transformedCode.trim(), expectedCode.trim(), message);
};

testGeneration(`
a = "foobar"
a //=> "foobar"
`, `
a = "foobar";
assert.deepEqual(a, "foobar");
`, 'add string asserts');

testGeneration(`
a = 1;
a //=> 1
`, `
a = 1;
assert.deepEqual(a, 1);
`, 'should add number asserts');

testGeneration(`
a = [1, 2, 3];
a //=> [1, 2, 3]
`, `
a = [1, 2, 3];
assert.deepEqual(a, [1, 2, 3]);
`, 'should add Array asserts');

testGeneration(`
a = { "a": 1 }
a //=> {a: 1}
`, `
a = { "a": 1 };
assert.deepEqual(a, { a: 1 });
`, 'should add Object asserts');

testGeneration(`
a = { "a": 1 }
console.log(a) //=> {a: 1}
`, `
a = { "a": 1 };
console.log(a);assert.deepEqual(a, { a: 1 });
`, 'should add console.log asserts');

testGeneration(`
a = { "a": 1 }
foobar(a) //=> {a: 1}
`, `
a = { "a": 1 };
assert.deepEqual(foobar(a), { a: 1 });
`, 'should add functioncall asserts');

testGeneration(`
a = { "foo": 1 }
a.foo //=> 1
`, `
a = { "foo": 1 };
assert.deepEqual(a.foo, 1);
`, 'should add Object property asserts');

testGeneration(`
a = "foobar"
a // => "foobar"
`, `
a = "foobar";
assert.deepEqual(a, "foobar");
`, 'add string asserts with space before arrow');

testGeneration(`
a = "foobar"
a // → "foobar"
`, `
a = "foobar";
assert.deepEqual(a, "foobar");
`, 'add string asserts with space utf8 arrow');
