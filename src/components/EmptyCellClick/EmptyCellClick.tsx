import React, { useEffect, useLayoutEffect, useRef } from "react";
import { dayWidth, weekWidth } from "@/constants";
import Icon from "../Icon";
import { StyledEmptyCellClickContent, StyledEmptyCellClickWrapper } from "./styles";
import type { EmptyCellClickProps } from "./types";

export default function EmptyCellClick({ onEmptyCellClick, cellData, zoom }: EmptyCellClickProps) {
  const { coords, disposition, resource } = cellData;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const resourceRef = useRef(resource);
  const focusedDateRef = useRef(cellData?.disposition?.focusedDate);
  const width = zoom === 0 ? weekWidth : dayWidth;

  useLayoutEffect(() => {
    // re calculate cell width before repaint
    if (!wrapperRef.current) return;

    const { width: cellWidth } = wrapperRef.current.getBoundingClientRect();

    if (cellWidth && coords.x && coords.y) {
      const xOffset = cellWidth / 2 + width / 2;
      wrapperRef.current.style.left = `${coords.x - xOffset}px`;
      wrapperRef.current.style.top = `${coords.y + 80}px`;
      focusedDateRef.current = cellData?.disposition?.focusedDate;
      resourceRef.current = resource;
    }

    // disposition.overtime affects cell's width, thus it's needed to recalculate it's coords whenever overtime changes
  }, [coords.x, width, disposition.overtime, coords.y, cellData.disposition, resource]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.style.left = `0px`;
    wrapperRef.current.style.top = `0px`;
  }, [zoom]);

  function onClick(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (focusedDateRef.current && resourceRef.current) {
      onEmptyCellClick(focusedDateRef.current.toDate(), resourceRef.current?.id);
    }
  }

  if (cellData.disposition?.occupancy?.length) {
    return null;
  }

  return (
    <StyledEmptyCellClickWrapper ref={wrapperRef} onClick={onClick}>
      <StyledEmptyCellClickContent>
        <Icon iconName="add" height="20" />
      </StyledEmptyCellClickContent>
    </StyledEmptyCellClickWrapper>
  );
}
