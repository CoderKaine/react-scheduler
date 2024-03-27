import type { CellData } from "@/types/global";

export type EmptyCellClickProps = {
  onEmptyCellClick: (date: Date, id: string) => void;
  cellData: CellData;
  zoom: number;
};
