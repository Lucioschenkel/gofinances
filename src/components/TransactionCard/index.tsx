import React from 'react';
import { categories } from '../../utils/categories';

import {
  Container,
  Title,
  Amount,
  Footer,
  Icon,
  Category,
  CategoryName,
  Date,
} from './styles';

interface Category {
  name: string;
  icon: string;
}

export interface TransactionCardProps {
  type: 'positive' | 'negative';
  title: string;
  amount: string;
  categoryKey: string;
  date: string;
}

interface Props {
  data: TransactionCardProps;
}

export function TransactionCard({ data }: Props) {
  const { title, amount, categoryKey, date, type } = data;

  const category = categories.find((category) => category.key === categoryKey);

  return (
    <Container>
      <Title>{title}</Title>

      <Amount type={type}>
        {type === 'negative' && '- '}
        {amount}
      </Amount>

      <Footer>
        <Category>
          <Icon name={category!.icon} />

          <CategoryName>{category!.name}</CategoryName>
        </Category>
        <Date>{date}</Date>
      </Footer>
    </Container>
  );
}
