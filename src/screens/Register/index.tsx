import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, Modal, TouchableWithoutFeedback, Alert } from "react-native";

import { InputForm } from "../../components/Forms/InputForm";
import { Button } from "../../components/Forms/Button";
import { CategorySelectButton } from "../../components/Forms/CategorySelectButton";
import { TransactionTypeButton } from "../../components/Forms/TransactionTypeButton";

import {
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionTypes,
} from "./styles";

import { CategorySelect } from "../CategorySelect";

interface FormData {
  name: string;
  amount: string;
}

export function Register() {
  const [transactionType, setTransactionType] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [category, setCategory] = useState({
    key: "category",
    name: "Categoria",
  });

  const { control, handleSubmit } = useForm();

  function handleSelectTransactionType(type: "up" | "down") {
    setTransactionType(type);
  }

  function handleCloseSelectCategory() {
    setCategoryModalOpen(false);
  }

  function handleOpenSelectCategory() {
    setCategoryModalOpen(true);
  }

  function handleRegister(form: FormData) {
    if (!transactionType) {
      return Alert.alert("Selecione o tipo da transação");
    }

    if (category.key === "category") {
      return Alert.alert("Selecione a categoria");
    }

    const data = {
      amount: form.amount,
      category,
      transactionType,
      name: form.name,
    };
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>
            <InputForm
              placeholder="Nome"
              name="name"
              control={control}
              autoCapitalize="sentences"
              autoCorrect={false}
            />
            <InputForm
              placeholder="Preço"
              name="amount"
              control={control}
              keyboardType="numeric"
            />

            <TransactionTypes>
              <TransactionTypeButton
                isActive={transactionType === "up"}
                type="up"
                onPress={() => handleSelectTransactionType("up")}
                title="Income"
              />
              <TransactionTypeButton
                isActive={transactionType === "down"}
                type="down"
                onPress={() => handleSelectTransactionType("down")}
                title="Outcome"
              />
            </TransactionTypes>

            <CategorySelectButton
              onPress={handleOpenSelectCategory}
              title={category.name}
            />
          </Fields>

          <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategory}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
