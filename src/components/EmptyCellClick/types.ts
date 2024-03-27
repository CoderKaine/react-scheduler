import type { TooltipData } from "@/types/global";

export type EmptyCellClickProps = {
  onEmptyCellClick: (date: Date, id: string) => void;
  tooltipData: TooltipData;
  zoom: number;
};
