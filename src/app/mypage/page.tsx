"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { usePathname } from "next/navigation";
import { NextUIProvider, Switch, Tabs, Tab, Card, CardBody, Accordion, AccordionItem } from "@nextui-org/react";
import '../globals.css';

interface User {
  name: string;
  email: string;
  provider: string;
}

const Mypage: React.FC = () => {
  const [isSelected, setIsSelected] = React.useState(true);
  const [userElem, setUserElem] = useState<User[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get('access-token');
    const getUserElem = async () => {
      try {
        const response = await axios.get('https://worldisaster.com/api/auth/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          setUserElem([response.data]);
        } else {
          setUserElem([]);
        }
      } catch (error) {
        console.log("Failed to retrieve user data", error);
        setUserElem([]);
      }
    };
    getUserElem();
  }, [pathname]);
  


  return (
    <>
      <NextUIProvider>
        <main className="flex flex-row">
          <section className="main-container flex-1">
            <div className="flex w-full flex-col mx-auto p-2 max-w-4xl">
              <Tabs aria-label="Options" className="w-full ">
                <Tab key="account" title="계정">
                  <Card className="p-3">
                    <CardBody>
                      <Accordion>
                        <AccordionItem key="1" aria-label="회원 정보" title="회원 정보">
                          <div className="flex flex-col gap-2">
                            {userElem.map((data, index) => (
                              <div key={index}>
                                <p>이름: {data.name}님 안녕하세요👋</p>
                                <p>이메일: {data.email}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionItem>
                        <AccordionItem key="2" aria-label="구독 설정" title="구독 설정">
                          <div>구독한 지역의 실시간 재난 재해 알림을 받아보세요! 🔔</div>
                          <div className="flex flex-row items-center gap-2 my-5">
                            <Switch isSelected={isSelected} onValueChange={setIsSelected}></Switch>
                            <p>{isSelected ? "구독 알림을 보내주세요!" : "구독 알림을 원하지 않아요"}</p>
                          </div>
                        </AccordionItem>
                        <AccordionItem key="3" aria-label="회원 탈퇴" title="회원 탈퇴">
                          Bye ✋
                        </AccordionItem>
                      </Accordion>
                    </CardBody>
                  </Card>  
                </Tab>
                <Tab key="support" title="후원">
                  <Card className="p-3">
                    <CardBody>
                      후원내역
                    </CardBody>
                  </Card>  
                </Tab>
              </Tabs>
            </div>
          </section>
        </main>
      </NextUIProvider>
    </>
  );
};

export default Mypage;