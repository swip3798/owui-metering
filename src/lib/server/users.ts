import { db } from './db';
import { usersTable } from './db/schema';

export const getAllUsers = async () => {
  return await db.select().from(usersTable).orderBy(usersTable.name);
};
