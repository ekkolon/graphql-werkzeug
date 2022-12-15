# _inherits_ - DirectiveDefinitionFactory

Factory function to generate a GraphQL directive that augments a type with fields from a set of other types in a GraphQL schema.

### GraphQL Signature

```graphql
directive @directiveName(types: [String!]!) on OBJECT_TYPE | INPUT_OBJECT_TYPE | INTERFACE_TYPE
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
function inheritsDirectiveDefinitionFactory(
  directiveName: string
): DirectiveDefinition;
```

## Usage / Examples

```ts
import {makeExecutableSchema} from '@graphql-tools/schema';
import {inheritsDirectiveDefinitionFactory} from '@ekkolon/graphql-werkzeug';

// 1. Initialize directive definition.
const inheritsDirective = inheritsDirectiveDefinitionFactory('inherits');
const inheritsDirectiveTransformer = inheritsDirective.transformer;
const inheritsDirectiveTypeDefs = inheritsDirective.typeDefs;

// 2. Add the directives's type definition to your schema.
const typeDefs = `
    ...
    ${inheritsDirectiveTypeDefs}
`;

let schema = makeExecutableSchema({typeDefs /* ... */});

// 3. Use the directive transformer from above to apply the directive to your schema.
schema = inheritsDirectiveTransformer(schema);
```

Use the directive as follows in your GraphQL schema:

```graphql
type Model {
  id: ID!
  createdAt: String!
  updatedAt: String!
}

type Post @inherits(types: ["Model"]) {
  title: String!
  datePublished: String!
}
```

Upon running your GraphQL server, the above schema definition will result in the following:

```graphql
type Post {
  # Properties inherited from `Model` type.
  # ---------------------------------------
  id: ID!
  createdAt: String!
  updatedAt: String!
  # ---------------------------------------

  title: String!
  datePublished: String!
}
```
