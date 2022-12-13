/**
 * @license
 * Copyright 2022 Nelson Dominguez
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {FieldValueError} from '../../common/';

interface BaseFieldValueLengthErrorOptions {
  input: unknown;
  field?: string;
}

interface FieldValueExactLengthErrorOptions
  extends BaseFieldValueLengthErrorOptions {
  toBeExact: number;
}

interface FieldValueRangeLengthErrorOptions
  extends BaseFieldValueLengthErrorOptions {
  toBeInRange: [number, number];
}

interface FieldValueAtLeastLengthErrorOptions
  extends BaseFieldValueLengthErrorOptions {
  toBeAtLeast: number;
}

interface FieldValueAtMostLengthErrorOptions
  extends BaseFieldValueLengthErrorOptions {
  toBeAtMost: number;
}

export type FieldValueLengthErrorOptions =
  | FieldValueAtLeastLengthErrorOptions
  | FieldValueAtMostLengthErrorOptions
  | FieldValueExactLengthErrorOptions
  | FieldValueRangeLengthErrorOptions;

interface LengthErrorKindMap {
  toBeExact: FieldValueExactLengthErrorOptions;
  toBeAtLeast: FieldValueAtLeastLengthErrorOptions;
  toBeAtMost: FieldValueAtMostLengthErrorOptions;
  toBeInRange: FieldValueRangeLengthErrorOptions;
}
const getLengthErrorKindFor = <K extends keyof LengthErrorKindMap>(
  key: K,
  opts: FieldValueLengthErrorOptions
): opts is LengthErrorKindMap[K] => {
  return Object.prototype.hasOwnProperty.call(opts, key);
};

const getLengthDirTag = (opts: FieldValueLengthErrorOptions): string => {
  const is = getLengthErrorKindFor;
  if (is('toBeInRange', opts)) {
    const range = opts['toBeInRange'];
    const start = Math.min(range[0], range[1]);
    const end = Math.max(range[0], range[1]);
    return `to be between ${start} and ${end}`;
  }
  if (is('toBeAtLeast', opts)) return `to be at least ${opts['toBeAtLeast']}`;
  if (is('toBeAtMost', opts)) return `to be at most ${opts['toBeAtMost']}`;
  if (is('toBeExact', opts)) return `to be exact ${opts['toBeExact']}`;
  return '';
};

const getInputLenWithType = ({
  input,
}: FieldValueLengthErrorOptions): [string, string] => {
  if (!input) ['0', typeof input];
  if (Array.isArray(input)) return [Array.length.toString(10), 'array'];
  if (typeof input === 'string') return [input.length.toString(10), 'string'];
  return [`${input}`, 'number'];
};

export class LengthValueError extends FieldValueError {
  constructor(options: FieldValueLengthErrorOptions) {
    const {field} = options;
    const [inputLen] = getInputLenWithType(options);
    const expectedToBe = getLengthDirTag(options);
    const errMessage = `Expected ${inputLen} ${expectedToBe}`;
    const extensions = field ? {field} : {};
    super(errMessage, {extensions});
  }
}
