import { type QueryClient, type QueryKey } from "@tanstack/react-query";

import { userQueries } from "@/entities/user/api/user-queries";
import { type User } from "@/entities/user/model/user";

export function readMyUser(queryClient: QueryClient): User | undefined {
  return queryClient.getQueryData<User>(userQueries.me().queryKey);
}

export function writeMyUser(queryClient: QueryClient, user: User): void {
  queryClient.setQueryData<User>(userQueries.me().queryKey, user);
  queryClient.setQueryData<User>(userQueries.detail(user.id).queryKey, user);
}

function myUserKeys(userId?: number): QueryKey[] {
  const keys: QueryKey[] = [userQueries.me().queryKey];
  if (userId != null) keys.push(userQueries.detail(userId).queryKey);

  return keys;
}

export async function cancelMyUserQueries(
  queryClient: QueryClient,
  userId?: number,
): Promise<void> {
  await Promise.all(
    myUserKeys(userId).map((queryKey) =>
      queryClient.cancelQueries({ queryKey }),
    ),
  );
}

export async function invalidateMyUser(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all(
    myUserKeys(readMyUser(queryClient)?.id).map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}
