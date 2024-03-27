import styled from "styled-components";

export const StyledEmptyCellClickWrapper = styled.div`
  padding: 8px 10px;
  position: absolute;
  background-color: ${({ theme }) => theme.colors.blue100};
  border-radius: 50px;
  z-index: 3;
  transition: all 0.25s;
  transition-timing-function: ease-out;
  cursor: pointer;
  pointer-events: auto;
  &:hover {
    transform: scale(1.1);
  }
`;

export const StyledEmptyCellClickContent = styled.div`
  width: 100%;
`;
