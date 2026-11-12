import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../services/api";
import { Feedback } from "../components/Feedback";
import { useAuth } from "../hooks/useAuth";
import { hora, salaCurta, type Release } from "../types";
const hoje = () =>
  new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
export function Sala() {
  const { user } = useAuth();
  const [items, setItems] = useState<Release[]>([]),
    [error, setError] = useState(""),
    [connected, setConnected] = useState(false);
  const [revision, setRevision] = useState(0),
    requestId = useRef(0);
  useEffect(() => {
    let active = true;
    async function refresh() {
      const id = ++requestId.current;
      try {
        const data = await api<Release[]>("/salas/minha/liberacoes");
        if (active && id === requestId.current) {
          setItems(data);
          setError("");
        }
      } catch (e) {
        if (active && id === requestId.current) setError((e as Error).message);
      }
    }
    const socket = io({ withCredentials: true, autoConnect: false });
    socket.on("connect", () => {
      setConnected(true);
      void refresh();
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => {
      setConnected(false);
    });
    socket.on("liberacao:criada", () => void refresh());
    const offline = () => { socket.disconnect(); setConnected(false); };
    const online = () => { socket.connect(); void refresh(); };
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    if (navigator.onLine) socket.connect();
    void refresh();
    // Also catches a new school day and provides recovery if a notification is lost.
    const timer = setInterval(() => void refresh(), 60_000);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
      socket.disconnect();
    };
  }, [revision]);
  const [latest, ...earlier] = items;
  // Conta de uma sala: a sala vem de qualquer chamada. Sala geral: várias salas,
  // então a sala aparece em cada chamada.
  const geral = !user?.salaId;
  const salaDaConta = !geral ? items.find((i) => i.aluno.sala)?.aluno.sala : undefined;
  const segmentoGeral = geral ? items.find((i) => i.aluno.sala)?.aluno.sala?.segmento.nome : undefined;
  const contexto = [hoje(), salaDaConta ? salaCurta(salaDaConta) : segmentoGeral]
    .filter(Boolean)
    .join(" · ");
  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Chamadas da portaria</h1>
          <p>
            {contexto.charAt(0).toUpperCase() + contexto.slice(1)}
          </p>
        </div>
        <p role="status" className={connected ? "live" : "live off"}>
          <span className="dot" aria-hidden="true" />
          {connected
            ? "Conectado"
            : "Reconectando · a lista será sincronizada automaticamente"}
        </p>
      </div>
      <Feedback error={error} />
      {error && (
        <button
          className="secondary retry"
          onClick={() => setRevision((r) => r + 1)}
        >
          Tentar novamente
        </button>
      )}
      {!latest ? (
        <section className="panel waiting">
          <h2>Nenhuma chamada até agora</h2>
          <p>Quando a portaria chamar um aluno desta sala, o nome aparece aqui</p>
        </section>
      ) : (
        <>
          <section className="panel latest" aria-label="Última chamada">
            <span className="latest-label">Última chamada</span>
            <h2>{latest.aluno.nome}</h2>
            <time dateTime={latest.dataHora}>{hora(latest.dataHora)}</time>
            {geral && latest.aluno.sala && (
              <span className="row-sub">{salaCurta(latest.aluno.sala)}</span>
            )}
          </section>
          {earlier.length > 0 && (
            <section className="panel" aria-labelledby="anteriores-titulo">
              <div className="panel-head">
                <h2 id="anteriores-titulo">Chamadas anteriores</h2>
              </div>
              <ol className="rows log">
                {earlier.map((item) => (
                  <li key={item.id}>
                    <time dateTime={item.dataHora}>{hora(item.dataHora)}</time>
                    <div className="row-main">
                      <h3>{item.aluno.nome}</h3>
                      {geral && item.aluno.sala && (
                        <span className="row-sub">
                          {salaCurta(item.aluno.sala)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </main>
  );
}
