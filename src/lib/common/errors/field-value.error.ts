import {GraphQLErrorOptions} from 'graphql';
import {GraphQLErrorCode, GraphQLErrorWithCode} from './errors';

/**
 *
 */
export class FieldValueError extends GraphQLErrorWithCode {
  constructor(message: string, options?: GraphQLErrorOptions) {
    super(message, GraphQLErrorCode.FieldValueError, options);
  }
}
