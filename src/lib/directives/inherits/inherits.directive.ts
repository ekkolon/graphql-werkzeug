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
  GraphQLError,
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeConfig,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLSchema,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
} from 'graphql';

import {DirectiveDefinition} from '../../directive-definition';

type Inheritable =
  | GraphQLInterfaceType
  | GraphQLObjectType
  | GraphQLInputObjectType;

const isInheritable = (type: unknown): type is Inheritable => {
  return (
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLInterfaceType ||
    type instanceof GraphQLInputObjectType
  );
};

export const DIRECTIVE_LOCATIONS = 'OBJECT | INPUT_OBJECT | INTERFACE';

/**
 * Generates a generic function for MapperKinds in the inheritsDirectiveFactory.
 */
function inheritsDirectiveMapperFactory(
  schema: GraphQLSchema,
  directiveName: string
) {
  return (receiver: Inheritable): Inheritable => {
    const receiverConfig = receiver.toConfig();
    const inheritsDirective = getDirective(
      schema,
      receiverConfig,
      directiveName
    )?.[0];

    if (!inheritsDirective) {
      // Directive is not a applied to receiver, leave it untouched.
      return receiver;
    }

    const typesToInherit: string[] = inheritsDirective['types'];

    typesToInherit.forEach(typeName => {
      const type = schema.getType(typeName);

      if (!type) {
        // Target to inherit does not exist.
        const errMessage = `Type '${typeName}' cannot be inherited because it does not exist in schema`;
        throw new GraphQLError(errMessage);
      }

      if (!isInheritable(type)) {
        // Invalid inheritance type.
        const errMessage = `Type '${typeName}' is not a valid inheritable type. Must be one of ${DIRECTIVE_LOCATIONS}`;
        throw new GraphQLError(errMessage);
      }

      const typeConfig = type.toConfig();
      const typeFields = Object.entries(typeConfig.fields);

      // Add/overwrite fields from the type to inherit to the receiver.
      typeFields.forEach(([name, field]) => {
        receiverConfig.fields[name] = field;
      });
    });

    // At this point, this default switch statement should never be reached.
    // This is because this factory function, when applied to locations other than those defined
    // in `DIRECTIVE_LOCATIONS`, throws an error raised by GraphQL itself.
    // However, in the unlikely scenario this factory function is used within a diferent MapperKind,
    // the switch statement will reach this default block.
    switch (true) {
      case isObjectType(receiver):
        return new GraphQLObjectType(
          receiverConfig as GraphQLObjectTypeConfig<unknown, unknown>
        );
      case isInputObjectType(receiver):
        return new GraphQLInputObjectType(
          receiverConfig as GraphQLInputObjectTypeConfig
        );
      case isInterfaceType(receiver):
        return new GraphQLInterfaceType(
          receiverConfig as GraphQLInterfaceTypeConfig<unknown, unknown>
        );
      default:
        throw new GraphQLError(
          `Unknown error occured while applying '${directiveName}' directive onto '${receiver.name}'`
        );
    }
  };
}

/**
 * Factory function providing a directive definition, that when added to a schema
 * and applied to one of a valid MapperKind, inherits all fields from the list
 * of type names included in the *types* argument of the directive.
 *
 * The directive transformer returned by this factory function can be applied to
 * the following MapperKind:
 *
 *  - MapperKind.OBJECT_TYPE
 *
 *  - MapperKind.INPUT_OBJECT_TYPE
 *
 *  - MapperKind.INTERFACE_TYPE
 *
 * @param directiveName The name of the directive in the GraphQL schema.
 * @throws GraphQLError When a value provided in the *types* arg of the directive
 *  does not exist in the schema.
 * @throws GraphQLError When a value provided in the *types* arg of the directive
 *  is not a valid MapperKind.
 * @returns Object that contains the GraphQL schema definition for the directive
 *  and a transformer factory function to apply the directive to the GraphQL schema.
 *
 * @example
 * ```ts
 *  const inheritsDirective = inheritsDirectiveFactory('inherits');
 *  const inheritsDirectiveTransformer = inheritsDirective.transformer;
 *  const inheritsDirectiveTypeDefs = inheritsDirective.typeDefs;
 *
 *  const typeDefs = `
 *   ...
 *   ${inheritsDirectiveTypeDefs}
 *  `;
 *
 *  let schema = makeExecutableSchema({ typeDefs, resolvers });
 *  schema = inheritsDirectiveTransformer(schema);
 * ```
 *
 * Use it as follows in any of your GraphQL files or definitions:
 *
 * ```graphql
 *
 *  type BaseType {
 *    id: ID!
 *  }
 *
 *  type Book @inherits(types: ["BaseType"]) {
 *    title: String!
 *    publishedAt: String!
 *  }
 * ```
 */
export function inheritsDirectiveDefinitionFactory(
  directiveName: string
): DirectiveDefinition {
  return {
    typeDefs: `directive @${directiveName}(types: [String!]!) on ${DIRECTIVE_LOCATIONS}`,
    transformer: (schema: GraphQLSchema) => {
      const mapperFn = inheritsDirectiveMapperFactory(
        schema,
        directiveName
      ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      return mapSchema(schema, {
        [MapperKind.OBJECT_TYPE]: mapperFn,
        [MapperKind.INPUT_OBJECT_TYPE]: mapperFn,
        [MapperKind.INTERFACE_TYPE]: mapperFn,
      });
    },
  };
}
