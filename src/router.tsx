import { Navigate } from "react-router-dom";
import ROUTES from "./constants/routes";
import MainLayout from "./layout/MainLayout";
import SignIn from "./pages/auth/SignIn";
import Forbidden from "./pages/fallback/Forbidden";
import NotFound from "./pages/fallback/NotFound";
import Dashboard from "./pages/main/Dashboard";
import ERDDesigner from "./pages/main/ERDDesigner";
import ERDEvaluation from "./pages/main/ERDEvaluation";
import MassEvaluationList from "./pages/main/MassEvaluation";
import BatchDetail from "./pages/main/MassEvaluation/BatchDetail";
import Documentation from "./pages/main/Documentation";
import Settings from "./pages/main/Settings";
import SignUp from "./pages/auth/SignUp";
import ERDDiagram from "./pages/main/ERDDiagram";

const authRoutes = {
  path: ROUTES.AUTH.ROOT,
  children: [
    {
      path: ROUTES.AUTH.SIGN_IN,
      element: <SignIn />,
    },
    {
      path: ROUTES.AUTH.SIGN_UP,
      element: <SignUp />,
    },
  ],
};

const mainRoutes = {
  path: ROUTES.DASHBOARD,
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <Dashboard />,
    },
    {
      path: ROUTES.ERD_DESIGNER,
      element: <ERDDesigner />,
    },
    {
      path: ROUTES.ERD_EVALUATION,
      element: <ERDEvaluation />,
    },
    {
      path: ROUTES.MASS_EVALUATION.ROOT,
      element: <MassEvaluationList />,
    },
    {
      path: ROUTES.MASS_EVALUATION.DETAIL,
      element: <BatchDetail />,
    },
    {
      path: ROUTES.DOCUMENTATION,
      element: <Documentation />,
    },
    {
      path: ROUTES.SETTINGS,
      element: <Settings />,
    },
    {
      path: ROUTES.ERD_DIAGRAM,
      element: <ERDDiagram />,
    },
  ],
};

export default [
  authRoutes,
  mainRoutes,
  {
    path: ROUTES.DASHBOARD,
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.NOT_FOUND,
        element: <NotFound />,
      },
      {
        path: ROUTES.FORBIDDEN,
        element: <Forbidden />,
      },
      {
        path: "*",
        element: <Navigate to={ROUTES.NOT_FOUND} replace />,
      },
    ],
  },
  { path: "*", element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
];
