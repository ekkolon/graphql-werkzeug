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

import {getDirective, MapperKind, mapSchema} from '@graphql-tools/utils';
import {
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLSchema,
  isNonNullType,
  isScalarType,
} from 'graphql';
import * as assert from 'node:assert';

import {DirectiveDefinition} from '../../directive-definition';
import {LengthValidator} from './length.validator';

const generateLengthTypeName = (
  name: string,
  minLength?: number,
  maxLength?: number
): string => {
  if (minLength === undefined && maxLength === undefined) {
    throw new Error("Expected at least one argument of 'min' | 'max'");
  }

  if (minLength && maxLength) {
    return `${name}WithLengthAtLeast${minLength}AtMost${maxLength}`;
  } else if (minLength) {
    return `${name}WithLengthAtLeast${minLength}`;
  } else {
    return `${name}WithLengthAtMost${maxLength}`;
  }
};

const validateLengthArgs = (
  input: string,
  min?: number,
  max?: number
): void => {
  if (min && max) {
    LengthValidator.range({input, min, max});
  } else if (min) {
    LengthValidator.min({input, expected: min});
  } else if (max) {
    LengthValidator.max({input, expected: max});
  }
};

class LimitedLengthType extends GraphQLScalarType {
  constructor(type: GraphQLScalarType, minLength?: number, maxLength?: number) {
    super({
      name: generateLengthTypeName(type.name, minLength, maxLength),

      serialize(value: unknown) {
        const newValue = type.serialize(value) as string;
        assert(typeof newValue.length === 'number');
        validateLengthArgs(newValue, minLength, maxLength);
        return newValue;
      },

      parseValue(value): string {
        return type.parseValue(value) as string;
      },

      parseLiteral(ast) {
        return type.parseLiteral(ast, {});
      },
    });
  }
}

const getLengthArgsIndex = (
  minLength?: number,
  maxLength?: number
): string | undefined => {
  if (minLength && maxLength) {
    return `atLeast${minLength}AtMost${maxLength}`;
  } else if (minLength) {
    return `atLeast${minLength}`;
  } else if (maxLength) {
    return `atMost${maxLength}`;
  }

  return undefined;
};

function lenghtDirectiveMapperFactory(
  schema: GraphQLSchema,
  directiveName: string
) {
  // Cache applied directives
  const limitedLengthTypes: Record<
    string,
    Record<string, GraphQLScalarType>
  > = {};

  function getLimitedLengthType(
    type: GraphQLScalarType,
    minLength?: number,
    maxLength?: number
  ): GraphQLScalarType {
    const limitedLengthTypesByTypeName = limitedLengthTypes[type.name];
    const lengthIndexName = getLengthArgsIndex(minLength, maxLength);
    if (!limitedLengthTypesByTypeName) {
      const newType = new LimitedLengthType(type, minLength, maxLength);

      // At this point min or max length argument is available.
      // This is because the `LimitedLengthType` class checks these args.
      limitedLengthTypes[type.name] = {};
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      limitedLengthTypes[type.name][lengthIndexName!] = newType;
      return newType;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const limitedLengthType = limitedLengthTypesByTypeName[lengthIndexName!];
    if (!limitedLengthType) {
      const newType = new LimitedLengthType(type, minLength, maxLength);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      limitedLengthTypesByTypeName[lengthIndexName!] = newType;
      return newType;
    }

    return limitedLengthType;
  }

  type Receiver =
    | GraphQLFieldConfig<unknown, unknown>
    | GraphQLInputFieldConfig;

  function wrapType<F extends Receiver>(
    fieldConfig: F,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    directiveArgumentMap: Record<string, any>
  ): void {
    if (
      isNonNullType(fieldConfig.type) &&
      isScalarType(fieldConfig.type.ofType)
    ) {
      fieldConfig.type = new GraphQLNonNull(
        getLimitedLengthType(
          fieldConfig.type.ofType,
          directiveArgumentMap['min'],
          directiveArgumentMap['max']
        )
      );
    } else if (isScalarType(fieldConfig.type)) {
      fieldConfig.type = getLimitedLengthType(
        fieldConfig.type,
        directiveArgumentMap['min'],
        directiveArgumentMap['max']
      );
    } else {
      throw new Error(`Not a scalar type: ${fieldConfig.type.toString()}`);
    }
  }

  return (receiver: Receiver) => {
    const lengthDirective = getDirective(schema, receiver, directiveName)?.[0];
    if (lengthDirective) {
      wrapType(receiver, lengthDirective);
    }
    return receiver;
  };
}

const DIRECTIVE_LOCATIONS = 'FIELD_DEFINITION | INPUT_FIELD_DEFINITION';
const DIRECTIVE_ARGS = 'min: Int, max: Int';

export function lengthDirectiveDefinitionFactory(
  directiveName: string
): DirectiveDefinition {
  return {
    typeDefs: `directive @${directiveName}(${DIRECTIVE_ARGS}) on ${DIRECTIVE_LOCATIONS}`,
    transformer: schema => {
      return mapSchema(schema, {
        [MapperKind.FIELD]: lenghtDirectiveMapperFactory(schema, directiveName),
      });
    },
  };
}
