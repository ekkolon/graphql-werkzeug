# _uppercase_ - DirectiveDefinitionFactory

Factory function to generate a GraphQL directive that converts a string-valued field to uppercase.

### GraphQL Signature

```graphql
directive @directiveName on FIELD_DEFINITION
```

Where `directiveName` equals to the provided _directiveName_ argument passed to the directive definition factory on initialization.

### Factory Signature

```ts
/**
 * @param {string} directiveName The name of the directive in the GraphQL schema.
 * @throws {GraphQLError} - When the type(s) provided in the `types` argument of the directive does not exist in the schema.
 * @throws {GraphQLError} - When the type(s) provided in the `types` argument of the directive is not a valid MapperKind.
 * @returns {DirectiveDefinition} Object that contains the GraphQL schema type definition for the directive
 *  and a transformer factory function to apply the directive to the GraphQL schema.
 */
function uppercaseDirectiveDefinitionFactory(
  directiveName: string
): DirectiveDefinition;
```

## Usage

```ts
import {makeExecutableSchema} from '@graphql-tools/schema';
import {uppercaseDirectiveDefinitionFactory} from '@ekkolon/graphql-werkzeug';

// 1. Initialize directive definition.
const uppercaseDirective = uppercaseDirectiveDefinitionFactory('uppercase');
const uppercaseDirectiveTransformer = uppercaseDirective.transformer;
const uppercaseDirectiveTypeDefs = uppercaseDirective.typeDefs;

// 2. Add the directives's type definition to your schema.
const typeDefs = `
    ...
    ${uppercaseDirectiveTypeDefs}
`;

let schema = makeExecutableSchema({typeDefs /* ... */});

// 3. Use the directive transformer from above to apply the directive to your schema.
schema = uppercaseDirectiveTransformer(schema);
```

Use the directive as follows in your GraphQL schema:

```graphql
type Post {
  title: String! @uppercase
  datePublished: String!
}
```
