"use client"

import React, { useEffect, useState } from "react";
import { NextUIProvider, Card, CardBody } from "@nextui-org/react";
import axios from "axios";
import Cookies from 'js-cookie';
import "../globals.css";

interface Disaster {
  objectId: number;
  dID: string;
  dSource: string;
  dStatus: string;
  dAlertLevel: string;
  dTitle: string;
}

const Support: React.FC = () => {

  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [selecteddID, setSelecteddID] = useState<string>("");
  const [amount, setAmount] = useState<string>('0');
  const [currency, setCurrency] = useState<string>("USD");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('access-token');
        const res = await axios.get('https://worldisaster.com/api/support', {
          headers: {
            'Authorization': `Bearer ${token}`,
            withCredentials: true,
          }
        });
        console.log('후원 리스트 데이터 로드 성공', res);
        setDisasters(res.data);
      } catch (error) {
        console.error('데이터 로드 실패', error);
      }
    };

    fetchData();
  }, []);

  const token = Cookies.get('access-token');

    const handleButtonClick = async () => {

      console.log("Before axios request - selecteddID:", selecteddID);
      console.log("Before axios request - amount:", amount);
      console.log("Before axios request - currency:", currency);

      try {
        const response = await axios.post('https://worldisaster.com/api/support/paypal',
          {
            dID: selecteddID,
            amount,
            currency,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`, // 헤더에 토큰 추가
              withCredentials: true, // 쿠키와 인증 정보를 포함
            },
          }
        );
        console.log('후원 요청 버튼 클릭',response);
        const approvalUrl = response.data.approvalUrl;
        console.log(approvalUrl);

        if (approvalUrl) {
            window.location.href = approvalUrl; // PayPal로 리디렉션
        } else {
            console.error('Approval URL is undefined!');
        }

      } catch (error) {
          console.error('Error: ', error);
      }
    };

    return (
      <>
        <NextUIProvider>
          <main className="flex flex-row">
            <section className="main-container flex-1">
              <div className="flex w-full flex-col mx-auto max-w-4xl">
                <Card className="flex flex-row px-3 py-10">

                  <CardBody className="w-full mx-auto py-3 gap-5 max-w-md h-96">
                    <div className="card">
                      후원할 지역의 상세정보 보여주기
                    </div>
                  </CardBody>

                  <CardBody className="py-3 gap-7">

                    <select 
                      name="재난 선택"
                      placeholder="현재 진행 중인 재난 확인하기" 
                      id="1" 
                      value={selecteddID}
                      onChange={(event) => setSelecteddID(event.target.value)}
                    >
                      {disasters.map((disaster) => (
                        <option 
                          key={disaster.objectId} 
                          value={disaster.dID}
                        >
                          {disaster.dTitle}
                        </option>
                      ))}
                    </select>

                    <input type="text" name="amount" id="amount" placeholder="0.00" onChange={(event) => setAmount(event.target.value)} />
                    <select
                      aria-label="통화 선택"
                      className="outline-none border-0 bg-transparent text-default-400 text-small"
                      id="currency"
                      name="currency"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                    >
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                    <button onClick={handleButtonClick}>후원하기</button>

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