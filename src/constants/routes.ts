const ROUTES = {
  AUTH: {
    ROOT: "/auth",
    SIGN_IN: "/auth/signin",
    SIGN_UP: "/auth/signup",
    CALLBACK: "/auth/callback",
  },
  DASHBOARD: "/",
  ERD_DESIGNER: "/erd-designer",
  ERD_EVALUATION: "/erd-evaluation",
  DOCUMENTATION: "/docs",
  SETTINGS: "/settings",

  NOT_FOUND: "/404",
  FORBIDDEN: "/403",
} as const;

export default ROUTES;
