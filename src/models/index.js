// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Seat } = initSchema(schema);

export {
  Seat
};