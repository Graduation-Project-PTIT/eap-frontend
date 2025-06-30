import { Amplify } from "aws-amplify";

export function configureAmplify() {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID;
  const userPoolDomain = import.meta.env.VITE_USER_POOL_DOMAIN;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          oauth: {
            domain: userPoolDomain,
            scopes: ["email", "profile", "openid"],
            redirectSignIn: [window.location.origin + "/auth/callback"],
            redirectSignOut: [window.location.origin],
            responseType: "code",
          },
        },
      },
    },
  });
}
