import styled, { css } from "styled-components/native";
import { Feather } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import theme from "../../../global/styles/theme";

interface IconProps {
  type: "up" | "down";
}

interface ContainerProps {
  isActive: boolean;
  type: "up" | "down";
}

const activeColors = {
  up: theme.colors.success_light,
  down: theme.colors.attention_light,
};

export const Container = styled.TouchableOpacity<ContainerProps>`
  width: 48%;
  flex-direction: row;
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.colors.text};
  border-radius: 5px;

  padding: 16px;
  justify-content: center;

  background-color: ${({ type, isActive }) =>
    isActive ? activeColors[type] : "transparent"};

  ${({ isActive }) =>
    isActive
      ? css`
          border: none;
        `
      : css`
          border: 1.5px solid ${({ theme }) => theme.colors.text};
        `}
`;

export const Title = styled.Text`
  font-size: ${RFValue(14)}px;
  font-family: ${({ theme }) => theme.fonts.regular};
`;

export const Icon = styled(Feather)<IconProps>`
  font-size: ${RFValue(24)}px;
  margin-right: 12px;

  color: ${({ type, theme }) =>
    type === "up" ? theme.colors.success : theme.colors.attention};
`;
