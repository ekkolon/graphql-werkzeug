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

import {LengthValueError} from './length.errors';

const determineValueLength = (value: unknown, strict: boolean): number => {
  if (Number.isInteger(value)) return value as number;
  if (Array.isArray(value) || typeof value === 'string') return value.length;
  if (strict === false) {
    throw new Error(
      'Type of value must be one of "array" | "string" | "number".'
    );
  }
  return 0;
};

interface BaseLengthValidatorconfig {
  input: unknown;
  strict?: boolean;
  field?: string;
}

interface LengthInRangerValidatorConfig extends BaseLengthValidatorconfig {
  min: number;
  max: number;
}

interface ExactLengthValidatorConfig extends BaseLengthValidatorconfig {
  expected: number;
}

interface MinLengthValidatorConfig extends BaseLengthValidatorconfig {
  expected: number;
}

interface MaxLengthValidatorConfig extends MinLengthValidatorConfig {
  expected: number;
  inclusive?: boolean;
}

const defaultLengthValidatorConfig: Partial<BaseLengthValidatorconfig> = {
  field: undefined,
  strict: true,
};

const mergeConfig = <T extends BaseLengthValidatorconfig>(config: T) => {
  return {...defaultLengthValidatorConfig, ...config} as T & {strict: boolean};
};

/**
 *
 */
export class LengthValidator {
  static range(config: LengthInRangerValidatorConfig): boolean {
    const {max, min, ...minMaxOpts} = mergeConfig(config);
    const isValidStart = LengthValidator.min({...minMaxOpts, expected: min});
    const isValidEnd = LengthValidator.max({...minMaxOpts, expected: max});
    if (isValidStart && isValidEnd) return true;
    if (minMaxOpts.strict === false) false;
    throw new LengthValueError({
      input: minMaxOpts.input,
      toBeInRange: [min, max],
      field: minMaxOpts.field,
    });
  }

  static min(config: MinLengthValidatorConfig): boolean {
    const {input, field, strict, expected} = mergeConfig(config);
    const val = determineValueLength(input, strict);
    if (val < expected) {
      if (strict === false) return false;
      throw new LengthValueError({input: val, toBeAtLeast: expected, field});
    }
    return true;
  }

  static max(config: MaxLengthValidatorConfig): boolean {
    const {input, field, strict} = mergeConfig(config);
    const val = determineValueLength(input, strict);
    const inclusive = config.inclusive ?? true;
    const expected = inclusive === true ? config.expected + 1 : config.expected;
    if (val > expected) {
      if (strict === false) return false;
      throw new LengthValueError({input: val, toBeAtMost: expected, field});
    }
    return true;
  }

  static exact(config: ExactLengthValidatorConfig): boolean {
    const {input, field, strict, expected} = mergeConfig(config);
    const val = determineValueLength(input, strict);
    if (val !== expected) {
      if (strict === false) return false;
      throw new LengthValueError({input: val, toBeExact: expected, field});
    }
    return true;
  }
}
