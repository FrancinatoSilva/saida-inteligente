export type User = {
  id: number;
  usuario: string;
  role: "GESTAO" | "PORTEIRO" | "SALA";
  salaId: number | null;
  segmentoId: number | null;
  escopo?: { segmento: string; serie: number | null } | null;
};
export type Sala = {
  id: number;
  serie: number;
  segmentoId: number;
  segmento: { id: number; nome: string };
};
export type Aluno = {
  id: number;
  matricula: string;
  nome: string;
  ativo: boolean;
  salaId: number;
  sala?: Sala;
};
export type Release = {
  id: number;
  dataHora: string;
  dataLiberacao: string;
  aluno: Aluno;
};
function serieLabel(serie: number, segmento: string) {
  return segmento === "Educação Infantil"
    ? `Infantil ${["", "", "II", "III", "IV", "V"][serie]}`
    : segmento === "Ensino Médio"
      ? `${serie}ª série`
      : `${serie}º ano`;
}
export function salaLabel(sala: Sala) {
  return serieLabel(sala.serie, sala.segmento.nome);
}
/** Como a conta aparece na interface: "1º ano" + "Fundamental I", "Sala geral" + "Ensino Médio", "Portaria". */
export function rotuloConta(user: User): { titulo: string; detalhe?: string } {
  if (user.role === "GESTAO") return { titulo: "Gestão" };
  if (user.role === "PORTEIRO") return { titulo: "Portaria" };
  const e = user.escopo;
  if (!e) return { titulo: "Sala" };
  if (e.serie === null) return { titulo: "Sala geral", detalhe: e.segmento };
  if (e.segmento === "Educação Infantil")
    return { titulo: serieLabel(e.serie, e.segmento), detalhe: "Educação Infantil" };
  return { titulo: serieLabel(e.serie, e.segmento), detalhe: e.segmento };
}
/** Sala + segmento em forma curta, ex.: "1º ano · Fundamental I", "2ª série · Médio". */
export function salaCurta(sala: Sala) {
  if (sala.segmento.nome === "Educação Infantil") return salaLabel(sala);
  return `${salaLabel(sala)} · ${sala.segmento.nome.replace(/^Ensino /, "")}`;
}
export function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
