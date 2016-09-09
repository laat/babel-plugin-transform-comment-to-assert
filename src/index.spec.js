import * as babel from 'babel-core';
import assert from 'assert-simple-tap';
import commentVisitor from './index.js';

const testGeneration = (code, expectedCode, message) => {
  const actual = babel.transform(code, { babelrc: false, plugins: [commentVisitor] }).code;
  assert.equal(actual.trim(), expectedCode.trim(), message);
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
console.log(a); //=> {a: 1}
`, `
a = { "a": 1 };
console.log(a); //=> {a: 1}

assert.deepEqual(a, { a: 1 });
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

testGeneration(`
const a = () => {
  throw new Error('fail');
};
a() // throws /fail/
`, `
const a = () => {
  throw new Error('fail');
};
assert.throws(() => {
  a();
}, /fail/);
`, 'throws expression');

testGeneration(`
const a = () => {
  throw new Error('fail');
};
a() // throws Error
`, `
const a = () => {
  throw new Error('fail');
};
assert.throws(() => {
  a();
}, Error);
`, 'throws expression');
