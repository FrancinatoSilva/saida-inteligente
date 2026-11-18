import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Feedback } from "../components/Feedback";
export const home = (role: string) =>
  role === "GESTAO" ? "/gestao" : role === "PORTEIRO" ? "/portaria" : "/sala";
export function Login() {
  const { user, login } = useAuth();
  const [usuario, setUsuario] = useState(""),
    [senha, setSenha] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (user) return <Navigate to={home(user.role)} replace />;
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await login(usuario, senha);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login">
      <div className="login-box">
        <span className="wordmark">Saída Inteligente</span>
        <h1>Entrar</h1>
        <p>Acesso da gestão, da portaria e das salas</p>
        <form className="panel" onSubmit={submit}>
          <label>
            Usuário
            <input
              autoComplete="username"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>
          <Feedback error={error} />
          <button disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
        </form>
      </div>
    </main>
  );
}
