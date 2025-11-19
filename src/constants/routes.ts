const ROUTES = {
  AUTH: {
    ROOT: "/auth",
    SIGN_IN: "/auth/signin",
    SIGN_UP: "/auth/signup",
    CALLBACK: "/auth/callback",
  },
  DASHBOARD: "/",
  CHATBOT: "/chat",
  CHATBOT_SESSION: "/chat/:conversationId",
  ERD_EVALUATION: "/erd-evaluation",
  MASS_EVALUATION: {
    ROOT: "/mass-evaluation",
    DETAIL: "/mass-evaluation/:batchId",
  },
  CLASS_MANAGEMENT: {
    ROOT: "/class-management",
  },
  STUDENT_MANAGEMENT: {
    ROOT: "/student-management",
  },
  SETTINGS: "/settings",
  ERD_DIAGRAM: "/erd-diagram",
  ERD_DESIGNER: "/erd-designer",
  DOCUMENTATION: "/documentation",

  NOT_FOUND: "/404",
  FORBIDDEN: "/403",
} as const;

export default ROUTES;
