import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/main/Dashboard";
import ERDDesigner from "./pages/main/ERDDesigner";
import Settings from "./pages/main/Settings";
import Documentation from "./pages/main/Documentation";
import ROUTES from "./constants/routes.ts";

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.ERD_DESIGNER} element={<ERDDesigner />} />
        <Route path={ROUTES.DOCUMENTATION} element={<Documentation />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
