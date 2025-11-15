import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Amplify } from "aws-amplify";
import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./components/common/notification-provider.tsx";
import { Toaster } from "sonner";
import { EcoAuthProvider } from "./authentication/EcoAuthProvider.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { OverlayProvider } from "./components/common/dragOverlayContext.tsx";

// if (import.meta.env.VITE_USE_MOCKS === "true") {
//   import("./mock/browser.ts").then(({ worker }) => {
//     worker.start();
//   });
// }

const apiEndpoint = import.meta.env.VITE_API_URL ?? "https://tr75eb7f04.execute-api.ap-southeast-1.amazonaws.com";

Amplify.configure({
  API: {
    REST: {
      BackendApi: {
        endpoint: apiEndpoint,
        region: "ap-southeast-1",
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <OverlayProvider>
        <NotificationProvider>
          <BrowserRouter>
            <EcoAuthProvider>
              <App />
            </EcoAuthProvider>
            <Toaster position="top-center" />
          </BrowserRouter>
        </NotificationProvider>
      </OverlayProvider>
    </ThemeProvider>
  </StrictMode>
);
