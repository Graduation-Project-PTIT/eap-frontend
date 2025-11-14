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
  MASS_EVALUATION: {
    ROOT: "/mass-evaluation",
    DETAIL: "/mass-evaluation/:batchId",
  },
  DOCUMENTATION: "/docs",
  SETTINGS: "/settings",
  ERD_DIAGRAM: "/erd-diagram",

  NOT_FOUND: "/404",
  FORBIDDEN: "/403",
} as const;

export default ROUTES;
