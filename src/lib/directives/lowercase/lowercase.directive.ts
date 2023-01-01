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
  defaultFieldResolver,
  GraphQLFieldConfig,
  GraphQLResolveInfo,
  GraphQLSchema,
} from 'graphql';

import {DirectiveDefinition} from '../../directive-definition';

export const DIRECTIVE_LOCATIONS = `FIELD_DEFINITION`;

const lowercaseDirectiveMapperFactory = (
  schema: GraphQLSchema,
  directiveName: string
) => {
  return (receiver: GraphQLFieldConfig<any, any>) => {
    const lowercaseDirective = getDirective(
      schema,
      receiver,
      directiveName?.[0]
    );
    if (!lowercaseDirective) {
      return receiver;
    }

    // Resolve field as lowercase
    const {resolve = defaultFieldResolver} = receiver;
    return {
      ...receiver,
      resolve: async (
        source: any,
        args: any,
        context: any,
        info: GraphQLResolveInfo
      ) => {
        const result = resolve(source, args, context, info);
        if (typeof result === 'string') {
          return result.toLowerCase();
        }
        return result;
      },
    };
  };
};

/**
 * Factory function to generate a GraphQL directive that converts a string-valued field to lowercase.
 *
 * @param directiveName The name of the directive in the GraphQL schema.
 * @returns Object that contains the GraphQL schema definition for the directive
 *  and a transformer factory function to apply the directive to the GraphQL schema.
 *
 * @example
 * ```ts
 *  // import {lowercaseDirectiveDefinitionFactory} from '@ekkolon/graphql-werkzeug';
 *
 *  const lowercaseDirective = lowercaseDirectiveFactory('lowercase');
 *  const lowercaseDirectiveTransformer = lowercaseDirective.transformer;
 *  const lowercaseDirectiveTypeDefs = lowercaseDirective.typeDefs;
 *
 *  const typeDefs = `
 *   ...
 *   ${lowercaseDirectiveTypeDefs}
 *  `;
 *
 *  let schema = makeExecutableSchema({ typeDefs, resolvers });
 *  schema = lowercaseDirectiveTransformer(schema);
 *
 *  * Use it as follows in any of your GraphQL files or definitions:
 *
 * ```graphql
 *  type Book {
 *    title: String! @lowercase
 *    publishedAt: String!
 *  }
 * ```
 */
export function lowercaseDirectiveDefinitionFactory(
  directiveName: string
): DirectiveDefinition {
  return {
    typeDefs: `directive @${directiveName} on ${DIRECTIVE_LOCATIONS}`,
    transformer: schema => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: lowercaseDirectiveMapperFactory(
          schema,
          directiveName
        ),
      });
    },
  };
}
