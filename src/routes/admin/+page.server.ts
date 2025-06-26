import { getAllUsers } from '$lib/server/users';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ }) => {
  const users = getAllUsers();

  return {
    users
  };
};
