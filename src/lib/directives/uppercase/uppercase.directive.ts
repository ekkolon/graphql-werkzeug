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

export const DIRECTIVE_LOCATIONS = 'FIELD_DEFINITION';

const uppercaseDirectiveMapperFactory = (
  schema: GraphQLSchema,
  directiveName: string
) => {
  return (receiver: GraphQLFieldConfig<any, any>) => {
    const uppercaseDirective = getDirective(
      schema,
      receiver,
      directiveName?.[0]
    );
    if (!uppercaseDirective) {
      return receiver;
    }

    // Resolve field as uppercase
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
          return result.toUpperCase();
        }
        return result;
      },
    };
  };
};

/**
 * Factory function to generate a GraphQL directive that transforms a GraphQLField
 * of type `String` to uppercase.
 *
 * @param directiveName The name of the directive in the GraphQL schema.
 * @returns Object that contains the GraphQL schema definition for the directive
 *  and a transformer factory function to apply the directive to the GraphQL schema.
 *
 * @example
 * ```ts
 *  // import {uppercaseDirectiveDefinitionFactory} from '@ekkolon/graphql-werkzeug';
 *
 *  const uppercaseDirective = uppercaseDirectiveFactory('uppercase');
 *  const uppercaseDirectiveTransformer = uppercaseDirective.transformer;
 *  const uppercaseDirectiveTypeDefs = uppercaseDirective.typeDefs;
 *
 *  const typeDefs = `
 *   ...
 *   ${uppercaseDirectiveTypeDefs}
 *  `;
 *
 *  let schema = makeExecutableSchema({ typeDefs, resolvers });
 *  schema = uppercaseDirectiveTransformer(schema);
 *
 *  * Use it as follows in any of your GraphQL files or definitions:
 *
 * ```graphql
 *  type Book {
 *    title: String! @uppercase
 *    publishedAt: String!
 *  }
 * ```
 */
export function uppercaseDirectiveDefinitionFactory(
  directiveName: string
): DirectiveDefinition {
  return {
    typeDefs: `directive @${directiveName} on ${DIRECTIVE_LOCATIONS}`,
    transformer: schema => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: uppercaseDirectiveMapperFactory(
          schema,
          directiveName
        ),
      });
    },
  };
}
