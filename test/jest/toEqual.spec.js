/* global test */

/* Adapted from the original jest tests. Please keep the link updated if you
 * update this later.
 *
 * https://github.com/facebook/jest/blob/ab6f4c3001a2cd917cc4df95e42dfc72f23c5a00/packages/jest-matchers/src/__tests__/matchers.test.js#L157-L245
 */

// The jestExpect here is actually our jestUnexpected version. Confusingly this
// is the opposite situation of the one in `../jestUnexpected.spec.js`.
const jestExpect = require('../../lib/jestUnexpected');
const expect = global.expect;

const {stringify} = require('jest-matcher-utils');

describe('.toEqual()', () => {
  [
    [true, false],
    [1, 2],
    [0, -0],
    [{a: 5}, {b: 6}],
    ['banana', 'apple'],
    [null, undefined],
    [new Set([1, 2]), new Set([2, 1])],
    // [{a: 1, b: 2}, jestExpect.objectContaining({a: 2})],
    // [false, jestExpect.objectContaining({a: 2})],
    // [[1, 3], jestExpect.arrayContaining([1, 2])],
    // [1, jestExpect.arrayContaining([1, 2])],
    // ['abd', jestExpect.stringContaining('bc')],
    // ['abd', jestExpect.stringMatching(/bc/i)],
    // [undefined, jestExpect.anything()],
    // [undefined, jestExpect.any(Function)],
    [{a: 1, b: 2}, expect.objectContaining({a: 2})],
    [false, expect.objectContaining({a: 2})],
    [[1, 3], expect.arrayContaining([1, 2])],
    [1, expect.arrayContaining([1, 2])],
    ['abd', expect.stringContaining('bc')],
    ['abd', expect.stringMatching(/bc/i)],
    [undefined, expect.anything()],
    [undefined, expect.any(Function)],
    [
      'Eve',
      {
        asymmetricMatch: function asymmetricMatch(who) {
          return who === 'Alice' || who === 'Bob';
        },
      },
    ],
  ].forEach(([a, b]) => {
    test(`{pass: false} expect(${stringify(a)}).toEqual(${stringify(
      b,
    )})`, () => {
      expect(() => jestExpect(a).toEqual(b)).toThrowErrorMatchingSnapshot();
    });
  });

  [
    [true, true],
    [1, 1],
    ['abc', 'abc'],
    [{a: 99}, {a: 99}],
    [new Set([1, 2]), new Set([1, 2])],
    [{a: 1, b: 2}, jestExpect.objectContaining({a: 1})],
    [[1, 2, 3], jestExpect.arrayContaining([2, 3])],
    ['abcd', jestExpect.stringContaining('bc')],
    ['abcd', jestExpect.stringMatching('bc')],
    [true, jestExpect.anything()],
    [() => {}, jestExpect.any(Function)],
    [
      {
        a: 1,
        b: function b() {},
        c: true,
      },
      {
        a: 1,
        b: jestExpect.any(Function),
        c: jestExpect.anything(),
      },
    ],
    [
      'Alice',
      {
        asymmetricMatch: function asymmetricMatch(who) {
          return who === 'Alice' || who === 'Bob';
        },
      },
    ],
  ].forEach(([a, b]) => {
    test(`{pass: false} expect(${stringify(a)}).not.toEqual(${stringify(
      b,
    )})`, () => {
      expect(() => jestExpect(a).not.toEqual(b)).toThrowErrorMatchingSnapshot();
    });
  });

  test('assertion error matcherResult property contains matcher name, expected and actual values', () => {
    const actual = {a: 1};
    const expected = {a: 2};
    try {
      jestExpect(actual).toEqual(expected);
    } catch (error) {
      expect(error.matcherResult).toEqual(
        expect.objectContaining({
          actual,
          expected,
          name: 'toEqual',
        }),
      );
    }
  });
});
