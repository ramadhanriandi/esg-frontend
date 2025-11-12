import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { User } from "../types/data-types";
import { EcoAuthContext } from "./EcoAuthContext";
import { post } from "aws-amplify/api";

export const EcoAuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<string | undefined>();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [roles, setRoles] = useState<string[]>([]);
  const [isRestored, setIsRestored] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("oidc.user");
    if (!raw) {
      setIsRestored(true);
      return;
    }

    const session = JSON.parse(raw);

    setAccessToken(session.access_token);
    setUser(session.profile?.sub);
    setUserName(session.profile?.name);
    setRoles(session.profile?.roles ?? []);
    setIsRestored(true);
  }, []);

  const login = async (formData: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const restOperation = await post({
        apiName: "BackendApi",
        path: "/auth/login",
        options: {
          body: formData,
          headers: { "Content-Type": "application/json" },
        },
      });

      const { body: responseBody } = await restOperation.response;
      const {
        token: access_token,
        id_token,
        userName,
      } = (await responseBody.json()) as {
        token: string;
        id_token: string;
        userName: string;
      };

      const decoded = JSON.parse(atob(access_token.split(".")[1]));
      const expiry = Math.floor(Date.now() / 1000) + 3600;

      const profile = {
        sub: decoded.sub,
        email: decoded.email,
        roles: decoded.roles ?? [],
        name: userName,
      };

      const oidcSession = {
        access_token,
        id_token: id_token || "",
        token_type: "Bearer",
        expires_at: expiry,
        profile,
      };

      sessionStorage.setItem("oidc.user", JSON.stringify(oidcSession));

      setUser(profile.sub);
      setAccessToken(access_token);
      setRoles(profile.roles);
      setUserName(profile.name);
      setIsRestored(true);
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Login error", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("oidc.user");
    setUser(undefined);
    setAccessToken(undefined);
    setUserName(undefined);
    setRoles([]);
    setIsRestored(false);
    window.location.href = "/";
  };

  return (
    <EcoAuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isLoading: isLoading,
        isRestored: isRestored,
        login,
        logout,
        user,
        userName,
        accessToken,
        roles,
        users,
      }}
    >
      {children}
    </EcoAuthContext.Provider>
  );
};
