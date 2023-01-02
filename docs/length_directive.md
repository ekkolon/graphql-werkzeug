# _length_ - DirectiveDefinitionFactory

Factory function to generate a GraphQL directive to enforce a minimum/maximum length for a string-valued field.

### GraphQL Signature

```graphql
directive @directiveName(
  min: Int
  max: Int
) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION
```

Where `directiveName` equals to the provided _directiveName_ argument passed to the directive definition factory on initialization.

### Factory Signature

```ts
/**
 * @param {string} directiveName The name of the directive in the GraphQL schema.
 * @throws {Error} When neither `min` nor `max` argument is provided.
 * @throws {LengthValueError} When both min and max arguments are provided and the field's value
 *  fails to meet the following precondition: min >= value <= max
 * @throws {LengthValueError} When only min argument is provided and the field's value
 *  fails to meet precondition `value >= min`.
 * @throws {LengthValueError} When only max argument is provided and the field's value
 *  fails to meet precondition `value <= max`.
 * @throws {Error} When the field the directive is applied to is not a `GraphQLScalar` type.
 *
 * @returns {DirectiveDefinition} Object that contains the GraphQL schema type definition for the directive
 *  and a transformer factory function to apply the directive to the GraphQL schema.
 */
function lengthDirectiveDefinitionFactory(
  directiveName: string
): DirectiveDefinition;
```

## Usage / Examples

```ts
import {makeExecutableSchema} from '@graphql-tools/schema';
import {lengthDirectiveDefinitionFactory} from '@ekkolon/graphql-werkzeug';

// 1. Initialize directive definition.
const lengthDirective = lengthDirectiveDefinitionFactory('length');
const lengthDirectiveTransformer = lengthDirective.transformer;
const lengthDirectiveTypeDefs = lengthDirective.typeDefs;

// 2. Add the directives's type definition to your schema.
const typeDefs = `
    ...
    ${lengthDirectiveTypeDefs}
`;

let schema = makeExecutableSchema({typeDefs /* ... */});

// 3. Use the directive transformer from above to apply the directive to your schema.
schema = lengthDirectiveTransformer(schema);
```

Use the directive as follows in your GraphQL schema:

```graphql
type Book {
  # Book title with a length of at most 80 characters.
  title: String! @length(max: 80)

  publishedAt: String!
}

type Author {
  name: String!

  # An alias for an Author with a length of at least 2 and at most 32 characters.
  alias: String @length(min: 2, max: 32)
}
```
