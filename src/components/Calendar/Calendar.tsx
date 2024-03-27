import { ChangeEvent, FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { useCalendar } from "@/context/CalendarProvider";
import type {
  Day,
  PaginatedSchedulerData,
  SchedulerData,
  SchedulerProjectData,
  CellData,
  ZoomLevel
} from "@/types/global";
import { getCellData } from "@/utils/getCellData";
import { getDatesRange } from "@/utils/getDatesRange";
import { usePagination } from "@/hooks/usePagination";
import EmptyCellClick from "../EmptyCellClick";
import EmptyBox from "../EmptyBox";
import { Grid, Header, LeftColumn, Tooltip } from "..";
import type { CalendarProps } from "./types";
import { StyledOuterWrapper, StyledInnerWrapper } from "./styles";

const initialCellData: CellData = {
  coords: { x: 0, y: 0 },
  resourceIndex: 0,
  disposition: {
    taken: { hours: 0, minutes: 0 },
    free: { hours: 0, minutes: 0 },
    overtime: { hours: 0, minutes: 0 }
  }
};

export const Calendar: FC<CalendarProps> = ({
  data,
  onTileClick,
  onItemClick,
  topBarWidth,
  onEmptyCellClick
}) => {
  const [cellData, setCellData] = useState<CellData>(initialCellData);
  const [filteredData, setFilteredData] = useState(data);
  const [isVisible, setIsVisible] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState("");
  const {
    zoom,
    startDate,
    date,
    config: { includeTakenHoursOnWeekendsInDayView, showTooltip }
  } = useCalendar();
  const gridRef = useRef<HTMLDivElement>(null);
  const datesRange = useMemo(() => getDatesRange(date, zoom), [date, zoom]);
  const {
    page,
    projectsPerPerson,
    totalRowsPerPage,
    rowsPerItem,
    currentPageNum,
    pagesAmount,
    next,
    previous,
    reset
  } = usePagination(filteredData, datesRange);
  const debouncedHandleMouseOver = useRef(
    debounce(
      (
        e: MouseEvent,
        startDate: Day,
        rowsPerItem: number[],
        projectsPerPerson: SchedulerProjectData[][][],
        zoom: ZoomLevel,
        page: PaginatedSchedulerData
      ) => {
        if (!gridRef.current) return;
        const { left, top } = gridRef.current.getBoundingClientRect();
        const cursorPosition = { x: e.clientX - left, y: e.clientY - top };
        const {
          coords: { x, y },
          resourceIndex,
          disposition,
          resource
        } = getCellData(
          startDate,
          cursorPosition,
          rowsPerItem,
          projectsPerPerson,
          zoom,
          includeTakenHoursOnWeekendsInDayView,
          page
        );
        setCellData({ coords: { x, y }, resourceIndex, disposition, resource });
        setIsVisible(true);
      },
      300
    )
  );
  const debouncedFilterData = useRef(
    debounce((dataToFilter: SchedulerData, enteredSearchPhrase: string) => {
      reset();
      setFilteredData(
        dataToFilter.filter((item) =>
          item.label.title.toLowerCase().includes(enteredSearchPhrase.toLowerCase())
        )
      );
    }, 500)
  );

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const phrase = event.target.value;
    setSearchPhrase(phrase);
    debouncedFilterData.current.cancel();
    debouncedFilterData.current(data, phrase);
  };

  const handleMouseLeave = useCallback(() => {
    debouncedHandleMouseOver.current.cancel();
    setIsVisible(false);
    setCellData(initialCellData);
  }, []);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) =>
      debouncedHandleMouseOver.current(e, startDate, rowsPerItem, projectsPerPerson, zoom, page);
    const gridArea = gridRef.current;

    if (!gridArea) return;

    gridArea.addEventListener("mousemove", handleMouseOver);
    gridArea.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      gridArea.removeEventListener("mousemove", handleMouseOver);
      gridArea.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    debouncedHandleMouseOver,
    handleMouseLeave,
    page,
    projectsPerPerson,
    rowsPerItem,
    startDate,
    zoom
  ]);

  useEffect(() => {
    if (searchPhrase) return;

    setFilteredData(data);
  }, [data, searchPhrase]);

  return (
    <StyledOuterWrapper>
      <LeftColumn
        data={page}
        pageNum={currentPageNum}
        pagesAmount={pagesAmount}
        rows={rowsPerItem}
        onLoadNext={next}
        onLoadPrevious={previous}
        searchInputValue={searchPhrase}
        onSearchInputChange={handleSearch}
        onItemClick={onItemClick}
      />
      <StyledInnerWrapper>
        <Header zoom={zoom} topBarWidth={topBarWidth} />
        {data.length ? (
          <Grid
            data={page}
            zoom={zoom}
            rows={totalRowsPerPage}
            ref={gridRef}
            onTileClick={onTileClick}
          />
        ) : (
          <EmptyBox />
        )}
        {onEmptyCellClick && (
          <EmptyCellClick onEmptyCellClick={onEmptyCellClick} cellData={cellData} zoom={zoom} />
        )}
        {showTooltip && isVisible && cellData?.resourceIndex > -1 && (
          <Tooltip tooltipData={cellData} zoom={zoom} />
        )}
      </StyledInnerWrapper>
    </StyledOuterWrapper>
  );
};

export default Calendar;
