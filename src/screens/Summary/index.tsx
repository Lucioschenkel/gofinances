import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityIndicator } from 'react-native';

import { HistoryCard } from '../../components/HistoryCard';
import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer,
} from './styles';
import { categories } from '../../utils/categories';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';

export interface TransactionData {
  type: 'positive' | 'negative';
  title: string;
  amount: string;
  categoryKey: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  color: string;
  total: number;
  totalFormatted: string;
  percentage: string;
}

export function Summary() {
  const [isLoading, setIsLoading] = useState(false);
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>(
    []
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();

  function handleDateChange(action: 'next' | 'prev') {
    if (action === 'next') {
      const newDate = addMonths(selectedDate, 1);
      setSelectedDate(newDate);
    } else {
      const newDate = subMonths(selectedDate, 1);
      setSelectedDate(newDate);
    }
  }

  async function loadData() {
    setIsLoading(true);
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);

    const responseFormatted = response ? JSON.parse(response) : [];

    const expenses = responseFormatted.filter(
      (transaction: TransactionData) =>
        transaction.type === 'negative' &&
        new Date(transaction.date).getMonth() === selectedDate.getMonth() &&
        new Date(transaction.date).getFullYear() === selectedDate.getFullYear()
    );

    const totalExpenses = expenses.reduce(
      (acc: number, curr: TransactionData) => acc + Number(curr.amount),
      0
    );

    const totalByCategory: CategoryData[] = [];

    categories.forEach((category) => {
      let categorySum = 0;

      expenses.forEach((expense: TransactionData) => {
        if (expense.categoryKey === category.key) {
          categorySum += Number(expense.amount);
        }
      });

      if (categorySum > 0) {
        const percentage = `${((categorySum / totalExpenses) * 100).toFixed(
          0
        )}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted: categorySum.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
          percentage,
        });
      }
    });

    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <Content
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: useBottomTabBarHeight(),
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <MonthSelect>
            <MonthSelectButton onPress={() => handleDateChange('prev')}>
              <MonthSelectIcon name="chevron-left" />
            </MonthSelectButton>

            <Month>
              {format(selectedDate, 'MMMM, yyyy', {
                locale: ptBR,
              })}
            </Month>

            <MonthSelectButton onPress={() => handleDateChange('next')}>
              <MonthSelectIcon name="chevron-right" />
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie
              data={totalByCategories}
              x="percentage"
              y="total"
              labelRadius={50}
              colorScale={totalByCategories.map((category) => category.color)}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: 'bold',
                  fill: theme.colors.shape,
                },
              }}
            />
          </ChartContainer>

          {totalByCategories.map(({ color, name, totalFormatted, key }) => (
            <HistoryCard
              title={name}
              amount={totalFormatted}
              color={color}
              key={key}
            />
          ))}
        </Content>
      )}
    </Container>
  );
}
