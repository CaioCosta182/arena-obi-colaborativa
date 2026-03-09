export type NivelOBI = 'Iniciação Nível 1' | 'Iniciação Nível 2' | 'Programação Júnior';

export interface QuestaoOBI {
  id: string;
  nivel: NivelOBI;
  titulo: string;
  descricao: string;
  output_esperado: string;
}

export const obiQuestions: QuestaoOBI[] = [
  // ==========================================
  // INICIAÇÃO NÍVEL 1 (OBI 2024 - Fase 1)
  // ==========================================
  {
    id: "obi_2024_n1_ogro",
    nivel: 'Iniciação Nível 1',
    titulo: "Ogro",
    descricao: "Se a mão esquerda (E) for maior que a direita (D), imprima E+D. Senão, imprima 2*(D-E). Calcule e imprima para E=5 e D=2.",
    output_esperado: "7" 
  },
  {
    id: "obi_2024_n1_relogio",
    nivel: 'Iniciação Nível 1',
    titulo: "Relógio",
    descricao: "Um relógio marca H=10 horas, M=20 minutos e S=30 segundos. Adicione T=40 segundos. Imprima os novos Segundos (Se passar de 60, lembre de ajustar!).",
    output_esperado: "10" // 30 + 40 = 70. 70 - 60 = 10 segundos.
  },
  {
    id: "obi_2024_n1_concurso",
    nivel: 'Iniciação Nível 1',
    titulo: "Concurso",
    descricao: "Crie uma lista com as notas [100, 80, 90]. Para aprovar K=2 candidatos, descubra e imprima a nota de corte (a 2ª maior nota).",
    output_esperado: "90"
  },

  // ==========================================
  // INICIAÇÃO NÍVEL 2 (OBI 2024 - Fase 1)
  // ==========================================
  {
    id: "obi_2024_n2_ogro",
    nivel: 'Iniciação Nível 2',
    titulo: "Ogro",
    descricao: "Se a mão esquerda (E) for maior que a direita (D), imprima E+D. Senão, imprima 2*(D-E). Calcule e imprima para E=2 e D=5.",
    output_esperado: "6" // 2*(5-2) = 6
  },
  {
    id: "obi_2024_n2_relogio",
    nivel: 'Iniciação Nível 2',
    titulo: "Relógio Avançado",
    descricao: "Um relógio marca H=23 horas, M=59 minutos e S=50 segundos. Adicione T=20 segundos. Imprima a nova Hora (Atenção ao virar o dia para 0!).",
    output_esperado: "0" // Vira o minuto, vira a hora de 23 para 0.
  },
  {
    id: "obi_2024_n2_concurso",
    nivel: 'Iniciação Nível 2',
    titulo: "Concurso",
    descricao: "Temos as notas [70, 50, 60, 90]. Queremos aprovar K=3 candidatos. Imprima a nota de corte (a 3ª maior nota).",
    output_esperado: "60"
  },
  {
    id: "obi_2024_n2_jogodavida",
    nivel: 'Iniciação Nível 2',
    titulo: "Jogo da Vida",
    descricao: "Uma célula está MORTA (0). Ela tem exatos 3 vizinhos VIVOS. Use um 'Se/Senão' para aplicar a regra do Jogo da Vida e imprima o novo estado dela (1 para viva, 0 para morta).",
    output_esperado: "1"
  },

  // ==========================================
  // PROGRAMAÇÃO JÚNIOR (OBI 2024 - Fase 1)
  // ==========================================
  {
    id: "obi_2024_pj_ogro",
    nivel: 'Programação Júnior',
    titulo: "Ogro",
    descricao: "Se a mão esquerda (E) for maior que a direita (D), imprima E+D. Senão, imprima 2*(D-E). Calcule e imprima para E=10 e D=10.",
    output_esperado: "0" // 2*(10-10) = 0
  },
  {
    id: "obi_2024_pj_bacterias",
    nivel: 'Programação Júnior',
    titulo: "Bactérias",
    descricao: "O dia começa com 1 bactéria e dobra a cada dia. Use um loop 'Enquanto' para calcular e imprimir em quantos dias a quantidade passará de N=30.",
    output_esperado: "5" // 1->2->4->8->16->32 (5 dias)
  },
  {
    id: "obi_2024_pj_concurso",
    nivel: 'Programação Júnior',
    titulo: "Concurso",
    descricao: "Dada a lista de notas [85, 95, 75, 100], precisamos de K=2 aprovados. Crie a lógica iterativa para imprimir a nota de corte.",
    output_esperado: "95"
  }
];
