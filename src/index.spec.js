import * as babel from "@babel/core";
import prettier from "prettier";
import assert from "assert-simple-tap";
import commentVisitor from "./index";

const format = (value) =>
  prettier.format(value.split(/\s/).join(""), { parser: "babel" });

const testGeneration = (code, expectedCode, message) => {
  const actualCode = babel.transform(code, {
    babelrc: false,
    plugins: [commentVisitor],
  }).code;
  assert.equal(format(actualCode), format(expectedCode), message);
};

testGeneration(
  `
a = "foobar"
a //=> "foobar"
`,
  `
a = "foobar";
assert.deepEqual(a, "foobar");
`,
  "add string asserts",
);

testGeneration(
  `
a = 1;
a //=> 1
`,
  `
a = 1;
assert.deepEqual(a, 1);
`,
  "should add number asserts",
);

testGeneration(
  `
a = [1, 2, 3];
a //=> [1, 2, 3]
`,
  `
a = [1, 2, 3];
assert.deepEqual(a, [1, 2, 3]);
`,
  "should add Array asserts",
);

testGeneration(
  `
a = { "a": 1 }
a //=> {a: 1}
`,
  `
a = { "a": 1 };
assert.deepEqual(a, { a: 1 });
`,
  "should add Object asserts",
);

testGeneration(
  `
a = { "a": 1 }
console.log(a); //=> {a: 1}
`,
  `
a = { "a": 1 };
console.log(a);assert.deepEqual(a, { a: 1 });
`,
  "should add console.log asserts",
);

testGeneration(
  `
a = { "a": 1 }
foobar(a) //=> {a: 1}
`,
  `
a = { "a": 1 };
assert.deepEqual(foobar(a), { a: 1 });
`,
  "should add functioncall asserts",
);

testGeneration(
  `
a = { "foo": 1 }
a.foo //=> 1
`,
  `
a = { "foo": 1 };
assert.deepEqual(a.foo, 1);
`,
  "should add Object property asserts",
);

testGeneration(
  `
a = "foobar"
a // => "foobar"
`,
  `
a = "foobar";
assert.deepEqual(a, "foobar");
`,
  "add string asserts with space before arrow",
);

testGeneration(
  `
a = "foobar"
a // → "foobar"
`,
  `
a = "foobar";
assert.deepEqual(a, "foobar");
`,
  "add string asserts with space utf8 arrow",
);

testGeneration(
  `
const a = () => {
  throw new Error('fail');
};
a() // throws /fail/
`,
  `
const a = () => {
  throw new Error('fail');
};
assert.throws(() => a(), /fail/);
`,
  "throws expression",
);

testGeneration(
  `
const a = () => {
  throw new Error('fail');
};
a() // throws Error
`,
  `
const a = () => {
  throw new Error('fail');
};
assert.throws(() => a(), Error);
`,
  "throws expression",
);

const testMessageGeneration = (code, expectedCode, message) => {
  const actualCode = babel.transform(code, {
    babelrc: false,
    plugins: [[commentVisitor, { message }]],
  }).code;
  assert.equal(
    format(actualCode),
    format(expectedCode),
    "with message: " + message,
  );
};

testMessageGeneration(
  `
a = "foobar"
a //=> "foobar"
`,
  `
a = "foobar";
assert.deepEqual(a, "foobar", "add string asserts");
`,
  "add string asserts",
);

testMessageGeneration(
  `
a = 1;
a //=> 1
`,
  `
a = 1;
assert.deepEqual(a, 1, "should add number asserts");
`,
  "should add number asserts",
);

testMessageGeneration(
  `
a = [1, 2, 3];
a //=> [1, 2, 3]
`,
  `
a = [1, 2, 3];
assert.deepEqual(a, [1, 2, 3], "should add Array asserts");
`,
  "should add Array asserts",
);

testMessageGeneration(
  `
a = { "a": 1 }
a //=> {a: 1}
`,
  `
a = { "a": 1 };
assert.deepEqual(a, { a: 1 }, "should add Object asserts");
`,
  "should add Object asserts",
);

testMessageGeneration(
  `
a = { "a": 1 }
console.log(a); //=> {a: 1}
`,
  `
a = { "a": 1 };
console.log(a);assert.deepEqual(a, { a: 1 }, 'should add console.log asserts');
`,
  "should add console.log asserts",
);

testMessageGeneration(
  `
a = { "a": 1 }
foobar(a) //=> {a: 1}
`,
  `
a = { "a": 1 };
assert.deepEqual(foobar(a), { a: 1 }, 'should add functioncall asserts');
`,
  "should add functioncall asserts",
);

testMessageGeneration(
  `
a = { "foo": 1 }
a.foo //=> 1
`,
  `
a = { "foo": 1 };
assert.deepEqual(a.foo, 1, 'should add Object property asserts');
`,
  "should add Object property asserts",
);

testMessageGeneration(
  `
a = "foobar"
a // => "foobar"
`,
  `
a = "foobar";
assert.deepEqual(a, "foobar", 'add string asserts with space before arrow');
`,
  "add string asserts with space before arrow",
);

testMessageGeneration(
  `
a = "foobar"
a // → "foobar"
`,
  `
a = "foobar";
assert.deepEqual(a, "foobar", 'add string asserts with space utf8 arrow');
`,
  "add string asserts with space utf8 arrow",
);

testMessageGeneration(
  `
const a = () => {
  throw new Error('fail');
};
a() // throws /fail/
`,
  `
const a = () => {
  throw new Error('fail');
};
assert.throws(() => a(), /fail/, 'throws expression');
`,
  "throws expression",
);

testMessageGeneration(
  `
const a = () => {
  throw new Error('fail');
};
a() // throws Error
`,
  `
const a = () => {
  throw new Error('fail');
};
assert.throws(() => a(), Error, 'throws expression');
`,
  "throws expression",
);
