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
import formatDate from 'dateformat';
import {defaultFieldResolver, GraphQLSchema, GraphQLString} from 'graphql';

import {DirectiveDefinition} from '../../directive-definition';

/**
 * Factory function to generate a GraphQL directive that returns a formatted string from
 * a resolved *Date* object. A client using this directive can decide which specific
 * date format to return.
 *
 * @param directiveName The name of the directive in the GraphQL schema.
 * @param defaultFormat The default date format to use when `format` argument is omitted.
 * @throws {Error} In the unlikely case no arguments (format or defaultFormat) are provided.
 * @returns Object that contains the GraphQL schema definition for the directive
 *  and a transformer factory function to apply the directive to the GraphQL schema.
 *
 * @example
 * ```ts
 *  const dateDirective = dateDirectiveFactory('date');
 *  const dateDirectiveTransformer = dateDirective.transformer;
 *  const dateDirectiveTypeDefs = dateDirective.typeDefs;
 *
 *  const typeDefs = `
 *   ...
 *   ${dateDirectiveTypeDefs}
 *  `;
 *
 *  let schema = makeExecutableSchema({ typeDefs, resolvers });
 *  schema = dateDirectiveTransformer(schema);
 * ```
 *
 * Use it as follows in any of your GraphQL files or definitions:
 *
 * ```graphql
 *  scalar Date
 *
 *  type Book {
 *    title: String!
 *    publishDate: Date! @date
 *  }
 * ```
 *
 * Query example:
 *
 * ```graphql
 *  query {
 *    books {
 *      publishDate(format: "d mmm yyyy")
 *    }
 *  }
 * ```
 */
export function dateDirectiveDefinitionFactory(
  directiveName: string,
  defaultFormat: string = 'mmmm d, yyyy'
): DirectiveDefinition {
  return {
    typeDefs: `directive @${directiveName}(defaultFormat: String = ${defaultFormat}) on FIELD_DEFINITION`,
    transformer: (schema: GraphQLSchema) => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: fieldConfig => {
          const dateDirective = getDirective(
            schema,
            fieldConfig,
            directiveName
          )?.[0];
          if (dateDirective) {
            const {resolve = defaultFieldResolver} = fieldConfig;
            const {defaultFormat} = dateDirective;

            if (!fieldConfig.args) {
              throw new Error(
                'Requires at least one argument, yet none was provided.'
              );
            }

            fieldConfig.args['format'] = {type: GraphQLString};
            fieldConfig.type = GraphQLString;
            fieldConfig.resolve = async (
              source,
              {format, ...args},
              context,
              info
            ) => {
              const newFormat = format ?? defaultFormat;
              const date = await resolve(source, args, context, info);
              return formatDate(date as string, newFormat, true);
            };
          }

          return fieldConfig;
        },
      });
    },
  };
}
