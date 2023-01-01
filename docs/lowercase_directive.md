# _lowercase_ - DirectiveDefinitionFactory

Factory function to generate a GraphQL directive that converts a string-valued field to lowercase.

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
function lowercaseDirectiveDefinitionFactory(
  directiveName: string
): DirectiveDefinition;
```

## Usage

```ts
import {makeExecutableSchema} from '@graphql-tools/schema';
import {lowercaseDirectiveDefinitionFactory} from '@ekkolon/graphql-werkzeug';

// 1. Initialize directive definition.
const lowercaseDirective = lowercaseDirectiveDefinitionFactory('lowercase');
const lowercaseDirectiveTransformer = lowercaseDirective.transformer;
const lowercaseDirectiveTypeDefs = lowercaseDirective.typeDefs;

// 2. Add the directives's type definition to your schema.
const typeDefs = `
    ...
    ${lowercaseDirectiveTypeDefs}
`;

let schema = makeExecutableSchema({typeDefs /* ... */});

// 3. Use the directive transformer from above to apply the directive to your schema.
schema = lowercaseDirectiveTransformer(schema);
```

Use the directive as follows in your GraphQL schema:

```graphql
type Post {
  title: String! @lowercase
  datePublished: String!
}
```
