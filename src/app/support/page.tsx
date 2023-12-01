"use client"

import React, { useState } from "react";
import { NextUIProvider, Card, CardBody, Autocomplete, AutocompleteItem, Input, Button } from "@nextui-org/react";
import nations from "../constants/nations";
import axios from "axios";
import "../globals.css";

interface User {
  name: string;
  email: string;
  provider: string;
}

const Support: React.FC = () => {

  const [DId, setDId] = useState('');
  const [amount, setAmount] = useState(0);

  const handleButtonClick = async () => {
    try {
      const response = await axios.post(
        'https://worldisaster.com/api/paypal/pay',
        {},
        {
          headers: {
            DId: DId,
            Amount: amount,
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <NextUIProvider>
        <main className="flex flex-row">
          <section className="main-container flex-1">
            <div className="cardcover">
              <Card className="flex flex-row px-3 py-10">

                <CardBody className="w-full mx-auto py-3 gap-5 max-w-md h-96">
                  <div className="card">
                    후원할 지역의 상세정보 보여주기 
                  </div>
                </CardBody>

                <CardBody className="py-3 gap-7">

                  <Autocomplete
                    aria-label="국가 선택"
                    placeholder="현재 진행 중인 재난 확인하기"
                    className="max-w-md"
                    >
                    {nations.map((nation) => (
                      <AutocompleteItem key={nation.value} value={nation.value} className="text-black">
                        {nation.label}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  <Input
                    placeholder="0.00"
                    labelPlacement="outside"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
                    endContent={
                      <div className="flex items-center">
                        <label className="sr-only" htmlFor="currency">
                          Currency
                        </label>
                        <select
                          aria-label="통화 선택"
                          className="outline-none border-0 bg-transparent text-default-400 text-small"
                          id="currency"
                          name="currency"
                        >
                          <option>USD</option>
                          <option>ARS</option>
                          <option>EUR</option>
                        </select>
                      </div>
                    }
                    type="number"
                  />

                  <Button color="primary" onClick={handleButtonClick}>
                    후원하기
                  </Button>

                </CardBody>

              </Card>
            </div>
          </section>
        </main>
      </NextUIProvider>
    </>
  );
};

export default Support;