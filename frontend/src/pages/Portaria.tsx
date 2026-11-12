import { useEffect, useState } from "react";
import { SchoolFilter } from "../components/SchoolFilter";
import { Feedback } from "../components/Feedback";
import { useSchool } from "../hooks/useSchool";
import { api, jsonBody } from "../services/api";
import { hora, salaCurta, type Release } from "../types";
export function Portaria() {
  const school = useSchool();
  const [busy, setBusy] = useState<number | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [history, setHistory] = useState<Release[]>([]),
    [data, setData] = useState(""),
    [revision, setRevision] = useState(0),
    [called, setCalled] = useState<Record<number, string>>({});
  useEffect(() => {
    let active = true;
    api<Release[]>(`/liberacoes${data ? `?data=${data}` : ""}`)
      .then((rows) => {
        if (active) setHistory(rows);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [data, revision]);
  async function call(id: number, nome: string) {
    if (busy !== null) return;
    setBusy(id);
    setError("");
    setMessage("");
    try {
      await api("/liberacoes", {
        method: "POST",
        body: jsonBody({ alunoId: id }),
      });
      setMessage(`Chamada de ${nome} registrada.`);
      setCalled((c) => ({ ...c, [id]: new Date().toISOString() }));
      setRevision((r) => r + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Chamar aluno</h1>
          <p>Escolha a sala, encontre o aluno e registre a chamada</p>
        </div>
      </div>
      <div className="split">
        <section className="panel" aria-labelledby="alunos-titulo">
          <div className="toolbar">
            <SchoolFilter
              {...school}
              onSegmento={school.setSegmento}
              onSala={school.setSalaId}
            />
            <label>
              Buscar por nome ou matrícula
              <input
                type="search"
                value={school.busca}
                onChange={(e) => school.setBusca(e.target.value)}
                placeholder="Nome ou matrícula"
              />
            </label>
          </div>
          <div className="panel-head">
            <h2 id="alunos-titulo">Alunos</h2>
            {school.salaId && !school.loading && (
              <span className="meta">
                {school.alunos.length}{" "}
                {school.alunos.length === 1 ? "aluno" : "alunos"}
              </span>
            )}
          </div>
          <Feedback error={error || school.error} message={message} />
          {school.error && (
            <button className="secondary retry" onClick={school.refresh}>
              Tentar novamente
            </button>
          )}
          {school.loading ? (
            <p className="empty" role="status">
              Carregando…
            </p>
          ) : !school.salaId ? (
            <p className="empty">Selecione o segmento e a sala</p>
          ) : school.alunos.length === 0 ? (
            <p className="empty">Nenhum aluno ativo encontrado.</p>
          ) : (
            <ul className="rows">
              {school.alunos.map((a) => (
                <li key={a.id}>
                  <div className="row-main">
                    <h3>{a.nome}</h3>
                    <span className="row-sub mono">{a.matricula}</span>
                  </div>
                  <div className="row-end">
                    {called[a.id] && (
                      <span className="called">
                        Chamado às <time>{hora(called[a.id])}</time>
                      </span>
                    )}
                    <button
                      disabled={busy !== null}
                      onClick={() => void call(a.id, a.nome)}
                    >
                      {busy === a.id ? "Chamando…" : "Chamar aluno"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel" aria-labelledby="registro-titulo">
          <div className="panel-head">
            <h2 id="registro-titulo">Registro de chamadas</h2>
            <button
              className="secondary small"
              onClick={() => setRevision((r) => r + 1)}
            >
              Atualizar
            </button>
          </div>
          <div className="panel-body" style={{ paddingBottom: 16 }}>
            <label>
              Data
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
              <span className="hint">Em branco mostra o dia de hoje</span>
            </label>
          </div>
          {history.length === 0 ? (
            <p className="empty">Nenhuma chamada nesta data</p>
          ) : (
            <ol className="rows log">
              {history.map((item) => (
                <li key={item.id}>
                  <time dateTime={item.dataHora}>{hora(item.dataHora)}</time>
                  <div className="row-main">
                    <span>{item.aluno.nome}</span>
                    {item.aluno.sala && (
                      <span className="row-sub">
                        {salaCurta(item.aluno.sala)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
