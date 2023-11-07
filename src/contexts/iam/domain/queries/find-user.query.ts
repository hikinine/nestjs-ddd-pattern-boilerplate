import { PaginationCriteria } from '@hiki9/rich-domain/dist';
import { RequireOnlyOne } from '@lib/common';

export type FindUserQueryProps = RequireOnlyOne<{
  id?: string;
  email?: string;
  refreshToken?: string;
  recoveryToken?: string;
  externalUserProviderId?: string;
  criteria?: PaginationCriteria;
}>;
/**
 * Query that finds a user by a given parameter. You  must choice only 1 parameter.
 * @param {string} [id] - The id of the user.
 * @param {string} [email] - The email of the user.
 * @param {string} [refreshToken] - Some refresh token of the user.
 * @param {string} [recoveryToken] - Some recovery token of the user.
 * @param {string} [externalUserProviderId] - Some OAuth id of the user in some external provider.
 * @param {PaginationCriteria} [criteria] - Some criteria to paginate the results.
 */
export class FindUserQuery {
  constructor(public readonly props: FindUserQueryProps) {}
}
