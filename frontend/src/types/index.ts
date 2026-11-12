export type User = {
  id: number;
  usuario: string;
  role: "GESTAO" | "PORTEIRO" | "SALA";
  salaId: number | null;
  segmentoId: number | null;
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
export function salaLabel(sala: Sala) {
  return sala.segmento.nome === "Educação Infantil"
    ? `Infantil ${["", "", "II", "III", "IV", "V"][sala.serie]}`
    : sala.segmento.nome === "Ensino Médio"
      ? `${sala.serie}ª série`
      : `${sala.serie}º ano`;
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
