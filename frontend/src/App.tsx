import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Login, home } from "./pages/Login";
import { Gestao } from "./pages/Gestao";
import { Portaria } from "./pages/Portaria";
import { Sala } from "./pages/Sala";
function Protected({ role }: { role: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={home(user.role)} replace />;
  return <Outlet />;
}
function Shell() {
  const { user, loading, error, logout, retry } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  if (loading)
    return (
      <main className="state" role="status">
        Verificando sessão…
      </main>
    );
  if (error)
    return (
      <main className="state">
        <p className="notice error" role="alert">
          {error}
        </p>
        <button className="retry" style={{ marginTop: 16 }} onClick={retry}>
          Tentar novamente
        </button>
      </main>
    );
  return (
    <>
      {user && (
        <header className="topbar">
          <div className="topbar-inner">
            <a href="/" className="wordmark">
              Saída Inteligente
            </a>
            <div className="topbar-user">
              <button
                className="secondary small"
                onClick={() => {
                  void logout().catch((e) => setLogoutError(e.message));
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </header>
      )}
      {logoutError && (
        <p className="notice error" role="alert">
          {logoutError}
        </p>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Protected role="GESTAO" />}>
          <Route path="/gestao" element={<Gestao />} />
        </Route>
        <Route element={<Protected role="PORTEIRO" />}>
          <Route path="/portaria" element={<Portaria />} />
        </Route>
        <Route element={<Protected role="SALA" />}>
          <Route path="/sala" element={<Sala />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={user ? home(user.role) : "/login"} replace />}
        />
      </Routes>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
