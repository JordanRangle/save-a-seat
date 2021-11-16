// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Bookings, Seat } = initSchema(schema);

export {
  Bookings,
  Seat
};