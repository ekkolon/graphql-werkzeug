# _date_ - DirectiveDefinitionFactory

Factory function to generate a GraphQL directive that returns a formatted string from
a resolved _Date_ object. A client using this directive can decide which specific
date format to return.

### GraphQL Signature

```graphql
directive @directiveName(
  format: String
  defaultFormat: String = "mmmm d, yyyy"
) on FIELD_DEFINITION
```

Where `directiveName` equals to the provided _directiveName_ argument passed to the directive definition factory on initialization.

### Factory Signature

```ts
/**
 * @param {string} directiveName The name of the directive in the GraphQL schema.
 * @param {string} defaultFormat The default date format to use when `format` argument is omitted.
 * @throws {Error} In the unlikely case no arguments (format or defaultFormat) are provided.
 * @returns {DirectiveDefinition} Object that contains the GraphQL schema type definition for the directive
 *  and a transformer factory function to apply the directive to the GraphQL schema.
 */
function dateDirectiveDefinitionFactory(
  directiveName: string,
  defaultFormat: string = 'mmmm d, yyyy'
): DirectiveDefinition;
```

## Usage / Examples

```ts
import {makeExecutableSchema} from '@graphql-tools/schema';
import {dateDirectiveDefinitionFactory} from '@ekkolon/graphql-werkzeug';

// 1. Initialize directive definition.
const dateDirective = dateDirectiveDefinitionFactory('date', 'mmmm d, yyyy');
const dateDirectiveTransformer = dateDirective.transformer;
const dateDirectiveTypeDefs = dateDirective.typeDefs;

// 2. Add the directives's type definition to your schema.
const typeDefs = `
    ...
    ${dateDirectiveTypeDefs}
`;

let schema = makeExecutableSchema({typeDefs /* ... */});

// 3. Use the directive transformer from above to apply the directive to your schema.
schema = dateDirectiveTransformer(schema);
```

Use the directive as follows in your GraphQL schema:

```graphql
scalar Date

type Book {
  title: String!
  publishDate: Date! @date
}
```

Query example:

```graphql
query {
  books {
    publishDate(format: "d mmm yyyy")
  }
}
```
