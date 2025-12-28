import { Navigate } from "react-router-dom";
import ROUTES from "./constants/routes";
import MainLayout from "./layout/MainLayout";
import SignIn from "./pages/auth/SignIn";
import Forbidden from "./pages/fallback/Forbidden";
import NotFound from "./pages/fallback/NotFound";
import Dashboard from "./pages/main/Dashboard";
import ERDEvaluation from "./pages/main/ERDEvaluation";
import MassEvaluationList from "./pages/main/MassEvaluation";
import BatchDetail from "./pages/main/MassEvaluation/BatchDetail";
import Settings from "./pages/main/Settings";
import SignUp from "./pages/auth/SignUp";
import Callback from "./pages/auth/Callback";
import Chatbot from "./pages/main/Chatbot";
import ClassManagement from "./pages/main/ClassManagement";
import StudentManagement from "./pages/main/StudentManagement";
import Profile from "./pages/main/Profile";
import UserManagement from "./pages/main/UserManagement";
import DiagramGallery from "./pages/main/DiagramGallery";
import DiagramDetail from "./pages/main/DiagramDetail";
import PermissionGuard from "./components/guards/PermissionGuard";
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
    {
      path: ROUTES.AUTH.CALLBACK,
      element: <Callback />,
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
      path: ROUTES.CHATBOT,
      element: <Chatbot />,
    },
    {
      path: ROUTES.CHATBOT_SESSION,
      element: <Chatbot />,
    },
    {
      path: ROUTES.ERD_EVALUATION,
      element: <ERDEvaluation />,
    },
    {
      path: ROUTES.ERD_DESIGNER,
      element: <ERDDiagram />,
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
      path: ROUTES.SETTINGS,
      element: <Settings />,
    },
    {
      path: ROUTES.PROFILE,
      element: <Profile />,
    },
    {
      path: ROUTES.DIAGRAM_GALLERY,
      element: <DiagramGallery />,
    },
    {
      path: ROUTES.DIAGRAM_DETAIL,
      element: <DiagramDetail />,
    },
    {
      path: ROUTES.CLASS_MANAGEMENT.ROOT,
      element: (
        <PermissionGuard requiredRole="teacher">
          <ClassManagement />
        </PermissionGuard>
      ),
    },
    {
      path: ROUTES.STUDENT_MANAGEMENT.ROOT,
      element: (
        <PermissionGuard requiredRole="teacher">
          <StudentManagement />
        </PermissionGuard>
      ),
    },
    {
      path: ROUTES.USER_MANAGEMENT,
      element: (
        <PermissionGuard requiredRole="admin">
          <UserManagement />
        </PermissionGuard>
      ),
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
