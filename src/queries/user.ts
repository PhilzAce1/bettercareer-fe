// POST /oauth/:provider

// :provider is google or linkedin
// Body is { token: string }
// https://bettercareer-staging-api.fly.dev/
import { createSmartApi } from '@lib/usable-query';
import Cookies from 'js-cookie';
import { UserData } from './types/user';

export const authApiCreator = createSmartApi({
	key: 'auth',
	endpoints: (builder) => ({
		getProfile: builder.query<
			undefined,
			{
				profile: UserData;
			}
		>({
			key: 'user',
			queryFn: () => ({
				url: `/profile`,
			}),
		}),

		oAuth: builder.mutation<
			{ email?: string; password?: string; provider?: string; token?: string },
			{ token: string; user: UserData; isNewUser?: boolean }
		>({
			key: 'oauth',
			mutationFn: ({ provider, token }) => ({
				url: `/oauth/${provider}`,
				method: 'POST',
				body: {
					token,
				},
			}),
		}),

		deleteAccount: builder.mutation({
			invalidatesQueries: ['user'],
			mutationFn: ({}) => ({
				url: `/profile`,
				method: 'DELETE',
			}),
		}),

		logOut: builder.query<
			undefined,
			{
				user: UserData;
			}
		>({
			key: 'logout',
			queryFn: () => ({
				url: `/logout`,
			}),
		}),
	}),
});

authApiCreator.startListening({
	matches: (action) => ['oauth'].includes(action.key),
	performAction: async (action: any) => {
		if (action.state === 'success') {
			return new Promise((resolve, reject) => {
				/**
				 * Evidently, this is needed to ensure that the cookie is set as Nextjs middleware is having stale date
				 * @see https://github.com/vercel/next.js/issues/49442
				 */
				const res = Cookies.set('bc_token', action.data?.token, {
					path: '/',
					sameSite: 'Lax',
					secure: process.env.NODE_ENV === 'production',
					expires: new Date(
						Date.now() + 1000 * 60 * 60 * 24 * 30
					) /* 30 days */,
				});

				if (res !== undefined) {
					resolve();
				} else {
					reject();
					throw new Error('Failed to set token');
				}
			});
		}
	},
});

export const {
	useLogOutQuery,
	useGetProfileQuery,
	useDeleteAccountMutation,
	useOAuthMutation,
} = authApiCreator;
