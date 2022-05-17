export type Operation = {
  id: string;
  name: string; // Наименование технологической операции
  activity: string; // Вид работы
  scope: string; // Разряд
  executionTime: number; // Норма времени на выполнение
  equipment: string; // Оборудование
  queue: number; // Порядок выполнения
}

export type Accordance = {
  input: string;
  output: string;
}

type Row = {
  c: ({ v: string } | null)[];
};

export type ExcelTable = {
  table: {
    rows: Row[];
  };
};