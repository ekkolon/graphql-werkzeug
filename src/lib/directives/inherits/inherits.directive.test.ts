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

import * as assert from 'node:assert';

// Import tooling
import {makeExecutableSchema} from '@graphql-tools/schema';

// Import directive components
import {
  DIRECTIVE_LOCATIONS,
  inheritsDirectiveDefinitionFactory,
} from './inherits.directive';

// ----------------------------------------------------------------------------------
// Initialize directive definition
// ----------------------------------------------------------------------------------
const inheritsDirective = inheritsDirectiveDefinitionFactory('inherits');
const {transformer, typeDefs} = inheritsDirective;

// ----------------------------------------------------------------------------------
// Check type definitions
// ----------------------------------------------------------------------------------
const expectedTypeDef = `directive @inherits(types: [String!]!) on ${DIRECTIVE_LOCATIONS}`;
assert.equal(typeDefs, expectedTypeDef);
console.log('[inheritsDirective] check typeDefs', '[PASSED]');

// ----------------------------------------------------------------------------------
// Check transformed output
// ----------------------------------------------------------------------------------
const schemaTypeDefs = `
    ${typeDefs}

    type Model {
        id: ID!
        createdAt: String!
        updatedAt: String
    }

    type Book @inherits(types: ["Model"]) {
        publisher: String!
        publisherID: Int!
    }
`;

// Make a schema that includes the directive's type definition
let schema = makeExecutableSchema({
  typeDefs: schemaTypeDefs,
});

// Apply directive resolver to schema.
schema = transformer(schema);

// ----------------------------------------------------------------------------------
// Evaluate whether the `Book` test type includes all expected fields
// ----------------------------------------------------------------------------------
// At this point, we expect the schema to include the `Book` type
const bookType = schema.getType('Book');
const bookTypeConfig = bookType?.toConfig();

const expectInheritedFieldNames = [
  'publisher',
  'publisherID',
  'id',
  'createdAt',
  'updatedAt',
];

// Check if all expected fields are indeed in the output type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bookTypeFields = (bookTypeConfig as any)['fields'];
const bookTypeFieldNames = Object.keys(bookTypeFields);
assert.deepEqual(expectInheritedFieldNames, bookTypeFieldNames);
console.log('[inheritsDirective] evaluate inherited fields', '[PASSED]');

// ----------------------------------------------------------------------------------
// Verify whether all output fields are of set type from the inherited type.
// ----------------------------------------------------------------------------------
bookTypeFieldNames.forEach(name => {
  const field = bookTypeFields[name];
  const fieldType = field.type;
  switch (name) {
    case 'publisherID':
      assert.equal(fieldType.toString(), 'Int!');
      break;
    case 'publisher':
      assert.equal(fieldType.toString(), 'String!');
      break;
    case 'createdAt':
      assert.equal(fieldType.toString(), 'String!');
      break;
    case 'updatedAt':
      assert.equal(fieldType.toString(), 'String');
      break;
    case 'id':
      assert.equal(fieldType.toString(), 'ID!');
      break;

    default:
      break;
  }
});
console.log('[inheritsDirective] evaluate inherited field types', '[PASSED]');
