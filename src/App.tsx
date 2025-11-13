import { PageNotFound } from "./components/pages/common/page-not-found";
import HomePage from "./components/pages/common/home";
import { Route, Routes } from "react-router-dom";
import OnboardingPage from "./components/pages/common/onboarding";
import LoginPage from "./components/pages/common/login";
import SignUpPage from "./components/pages/common/sign-up";
import VerifyEmailPage from "./components/pages/common/verify-email";
import { ProtectedRoute } from "./authentication/authenticationGuard";
import DashboardPage from "./components/pages/protected/dashboard";
import CompliancePage from "./components/pages/protected/compliance";
import DeveloperPage from "./components/pages/protected/devloper";

import "./App.css";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/*" element={<PageNotFound />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/developer" element={<DeveloperPage />} />
      </Route>
    </Routes>
  );
}

export default App;
