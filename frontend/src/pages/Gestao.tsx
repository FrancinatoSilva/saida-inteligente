import { useState, type FormEvent } from "react";
import { useSchool } from "../hooks/useSchool";
import { SchoolFilter } from "../components/SchoolFilter";
import { Feedback } from "../components/Feedback";
import { api, jsonBody } from "../services/api";
import { salaCurta, type Aluno } from "../types";
export function Gestao() {
  const school = useSchool();
  const [editing, setEditing] = useState<Aluno | null>(null),
    [nome, setNome] = useState(""),
    [matricula, setMatricula] = useState(""),
    [targetSala, setTargetSala] = useState("");
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [importText, setImportText] = useState("");
  async function action(operation: () => Promise<unknown>, success: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await operation();
      setMessage(success);
      school.refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setEditing(null);
    setNome("");
    setMatricula("");
    setTargetSala("");
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const ok = await action(
      () =>
        api(editing ? `/alunos/${editing.id}` : "/alunos", {
          method: editing ? "PUT" : "POST",
          body: jsonBody({
            nome,
            matricula,
            salaId: Number(targetSala || school.salaId),
          }),
        }),
      editing ? "Aluno atualizado." : "Aluno cadastrado.",
    );
    if (ok) reset();
  }
  async function importFile(e: FormEvent) {
    e.preventDefault();
    await action(async () => {
      const parsed = JSON.parse(importText);
      await api(`/salas/${school.salaId}/alunos/importacao`, {
        method: "POST",
        body: jsonBody(parsed),
      });
      setImportText("");
    }, "Importação concluída. Todos os alunos foram cadastrados.");
  }
  const salaAtual = school.salas.find((s) => String(s.id) === school.salaId);
  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Alunos</h1>
          <p>Cadastro de alunos por segmento e sala</p>
        </div>
      </div>
      <section className="panel">
        <div className="toolbar" style={{ borderBottom: 0 }}>
          <SchoolFilter
            {...school}
            onSegmento={(value) => {
              school.setSegmento(value);
              reset();
            }}
            onSala={(value) => {
              school.setSalaId(value);
              reset();
            }}
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
      </section>
      <div style={{ marginTop: 16 }}>
        <Feedback error={error || school.error} message={message} />
        {school.error && (
          <button className="secondary retry" onClick={school.refresh}>
            Tentar novamente
          </button>
        )}
      </div>
      {school.salaId ? (
        <>
          <section className="panel" aria-labelledby="lista-titulo">
            <div className="panel-head">
              <h2 id="lista-titulo">
                {salaAtual ? salaCurta(salaAtual) : "Alunos da sala"}
              </h2>
              {!school.loading && (
                <span className="meta">
                  {school.alunos.length}{" "}
                  {school.alunos.length === 1 ? "aluno" : "alunos"}
                </span>
              )}
            </div>
            {school.loading ? (
              <p className="empty" role="status">
                Carregando…
              </p>
            ) : school.alunos.length === 0 ? (
              <p className="empty">Nenhum aluno encontrado</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Matrícula</th>
                      <th>Situação</th>
                      <th className="end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {school.alunos.map((a) => (
                      <tr key={a.id}>
                        <td>{a.nome}</td>
                        <td className="mono">{a.matricula}</td>
                        <td>
                          <span
                            className={a.ativo ? "situacao" : "situacao off"}
                          >
                            <span
                              className={a.ativo ? "dot on" : "dot"}
                              aria-hidden="true"
                            />
                            {a.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="end">
                          <div className="actions">
                            <button
                              className="secondary small"
                              disabled={busy}
                              onClick={() => {
                                setEditing(a);
                                setNome(a.nome);
                                setMatricula(a.matricula);
                                setTargetSala(String(a.salaId));
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="secondary small"
                              disabled={busy}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `${a.ativo ? "Inativar" : "Reativar"} ${a.nome}?`,
                                  )
                                )
                                  void action(
                                    () =>
                                      api(`/alunos/${a.id}/status`, {
                                        method: "PATCH",
                                        body: jsonBody({ ativo: !a.ativo }),
                                      }),
                                    "Situação atualizada.",
                                  );
                              }}
                            >
                              {a.ativo ? "Inativar" : "Reativar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <div className="columns">
            <form className="panel" onSubmit={save}>
              <div className="panel-head">
                <h2>{editing ? "Editar aluno" : "Adicionar aluno"}</h2>
              </div>
              <fieldset disabled={busy} className="panel-body">
                <label>
                  Nome do aluno
                  <input
                    required
                    maxLength={200}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </label>
                <label>
                  Matrícula
                  <input
                    required
                    maxLength={200}
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                  />
                </label>
                {editing && (
                  <label>
                    Sala do aluno
                    <select
                      value={targetSala}
                      onChange={(e) => setTargetSala(e.target.value)}
                    >
                      {school.salas.map((s) => (
                        <option key={s.id} value={s.id}>
                          {salaCurta(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="actions">
                  <button>{busy ? "Salvando…" : "Salvar aluno"}</button>
                  {editing && (
                    <button type="button" className="secondary" onClick={reset}>
                      Cancelar edição
                    </button>
                  )}
                </div>
              </fieldset>
            </form>
            <form className="panel" onSubmit={importFile}>
              <div className="panel-head">
                <h2>Importar alunos</h2>
              </div>
              <div className="panel-body">
                <p className="hint" style={{ marginBottom: 16 }}>
                  Arquivo JSON com a lista <code>alunos</code>, cada um com{" "}
                  <code>matricula</code> e <code>nome</code>. Todos entram na
                  sala selecionada.
                </p>
                <label style={{ marginBottom: 16 }}>
                  Arquivo JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    disabled={busy}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 1_000_000) {
                        setError("Arquivo excede 1 MB.");
                        return;
                      }
                      try {
                        setImportText(await file.text());
                      } catch {
                        setError("Não foi possível ler o arquivo.");
                      }
                    }}
                  />
                </label>
                <label style={{ marginBottom: 16 }}>
                  Conteúdo JSON
                  <textarea
                    rows={5}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={
                      '{"alunos":[{"matricula":"20260001","nome":"Ana Silva"}]}'
                    }
                    required
                  />
                </label>
                <button disabled={busy || !importText}>
                  Importar para esta sala
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <section className="panel waiting">
          <h2>Selecione o segmento e a sala</h2>
          <p>A lista de alunos e os formulários de cadastro aparecem aqui</p>
        </section>
      )}
    </main>
  );
}
