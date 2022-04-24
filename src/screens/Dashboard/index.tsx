import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import { HighlightCard } from '../../components/HighlightCard';
import {
  TransactionCard,
  TransactionCardProps,
} from '../../components/TransactionCard';

import {
  Container,
  Header,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  UserWrapper,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionsList,
  LogoutButton,
  LoadContainer,
} from './styles';
import { Alert } from 'react-native';
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  income: HighlightProps;
  expenses: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );
  const { signOut, user } = useAuth();

  const theme = useTheme();

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative'
  ) {
    const collectionFiltered = collection.filter(
      (transaction) => transaction.type === type
    );

    if (collectionFiltered.length === 0) {
      return 0;
    }

    const lastTransaction = new Date(
      Math.max.apply(
        Math,
        collectionFiltered.map((transaction) =>
          new Date(transaction.date).getTime()
        )
      )
    );

    return lastTransaction.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
    });
  }

  async function loadTransactions() {
    try {
      const dataKey = `@gofinances:transactions_user:${user.id}`;
      const response = await AsyncStorage.getItem(dataKey);

      const transactions = response ? JSON.parse(response) : [];

      let incomeSum = 0;
      let expensesSum = 0;

      const transactionsFormatted: DataListProps[] = transactions.map(
        (item: DataListProps) => {
          if (item.type === 'positive') {
            incomeSum += Number(item.amount);
          } else {
            expensesSum += Number(item.amount);
          }

          const amount = Number(item.amount).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });

          const date = new Date(item.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          });

          return {
            id: item.id,
            title: item.title,
            amount,
            date,
            type: item.type,
            categoryKey: item.categoryKey,
          };
        }
      );

      setData(transactionsFormatted);

      const lastIncomeDate = getLastTransactionDate(transactions, 'positive');
      const lastExpenseDate = getLastTransactionDate(transactions, 'negative');

      const interval =
        lastExpenseDate === 0 ? 'Não há transações' : `01 a ${lastExpenseDate}`;

      setHighlightData({
        expenses: {
          amount: expensesSum.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
          lastTransaction:
            lastExpenseDate === 0
              ? 'Não há transações'
              : `Última saída dia ${lastExpenseDate}`,
        },
        income: {
          amount: incomeSum.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
          lastTransaction:
            lastIncomeDate === 0
              ? 'Não há transações'
              : `Última entrada dia ${lastIncomeDate}`,
        },
        total: {
          amount: (incomeSum - expensesSum).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
          lastTransaction: interval,
        },
      });

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possível recuperar a lista de transações');
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: user.photo }} />
                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              title="Entradas"
              amount={highlightData.income.amount}
              lastTransaction={highlightData.income.lastTransaction}
              type="up"
            />
            <HighlightCard
              title="Saídas"
              amount={highlightData.expenses.amount}
              lastTransaction={highlightData.expenses.lastTransaction}
              type="down"
            />
            <HighlightCard
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
              type="total"
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionsList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TransactionCard data={item}></TransactionCard>
              )}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
