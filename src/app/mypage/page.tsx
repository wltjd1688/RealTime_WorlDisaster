"use client"

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NextUIProvider, Tabs, Tab, Card, CardBody, Accordion, AccordionItem } from "@nextui-org/react";
import { nations } from "../constants/nation";
import Cookies from "js-cookie";
import axios from "axios";
import "../globals.css";

interface UserInfo {
  name: string;
  email: string;
  provider: string;
}

interface MypageProps {}

const Mypage: React.FC<MypageProps> = () => {

  const [loading, setLoading] = useState(false);

  const [userInfo, setuserInfo] = useState<UserInfo[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("access-token");
    const getuserInfo = async () => {
      try {
        const response = await axios.get<UserInfo>(
          "https://worldisaster.com/api/auth/info",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          setuserInfo([response.data]);
        } else {
          setuserInfo([]);
        }
      } catch (error) {
        console.log("Failed to retrieve UserInfo data", error);
        setuserInfo([]);
      }
    };
    getuserInfo();
  }, [pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("access-token");
        const response = await axios.get<UserInfo>("https://worldisaster.com/api/auth/info",{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("구독 정보 받아따 얍:", response.data);
      } catch (error) {
        console.error("데이터 로드 실패", error);
      }
    };

    fetchData();
  }, []);


  const handleSaveSettings = async () => {
    const token = Cookies.get("access-token");

    try {
      setLoading(true); // 서버 응답 대기 중임을 나타내는 상태 업데이트

      const response = await axios.post("https://worldisaster.com/api/auth/info",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("설정이 성공적으로 저장되었습니다:", response.data);
    } catch (error) {
      console.error("설정 저장에 실패했습니다", error);
    } finally {
      setLoading(false); // 서버 응답 대기가 끝났음을 나타내는 상태 업데이트
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('access-token');
        const res = await axios.get('https://worldisaster.com/api/support/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            withCredentials: true,
          }
        });
        console.log('후원 내역 데이터 로드 성공', res);
      } catch (error) {
        console.error('후원 내역 데이터 로드 실패', error);
      }
    };

    fetchData();
  }, []);

  ///////////////////////////////////  알림  ////////////////////////////////////////

  // 각 국가 선택 상태
  const [nation1, setNation1] = useState("");
  const [nation2, setNation2] = useState("");
  const [nation3, setNation3] = useState("");

  // 선택된 국가를 다른 select 박스에서 disabled 시키는 함수
  const isDisabledOption = (optionValue: string) => {
    return optionValue === nation1 || optionValue === nation2 || optionValue === nation3;
  };

  // 경보 레벨 상태 정의
  const [redAlert, setRedAlert] = useState(false);
  const [orangeAlert, setOrangeAlert] = useState(false);
  const [greenAlert, setGreenAlert] = useState(false);

  // 경보 레벨 상태 토글 함수
  const toggleRedAlert = () => setRedAlert(!redAlert);
  const toggleOrangeAlert = () => setOrangeAlert(!orangeAlert);
  const toggleGreenAlert = () => setGreenAlert(!greenAlert);

  // 저장 버튼 함수
  const handleSave = async () => {
    const token = Cookies.get("access-token");
  
    try {
      setLoading(true); // 서버 응답 대기 중임을 나타내는 상태 업데이트
  
      const response = await axios.post(
        "https://worldisaster.com/api/auth/info",
        {
          nation1,
          nation2,
          nation3,
          redAlert,
          orangeAlert,
          greenAlert,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("설정이 성공적으로 저장되었습니다:", response.data);
      alert('저장 성공!');
    } catch (error) {
      console.error("설정 저장에 실패했습니다", error);
    } finally {
      setLoading(false); // 서버 응답 대기가 끝났음을 나타내는 상태 업데이트
    }
  };
  

  return (
    <>
      <NextUIProvider>
        <main className="flex flex-row">
          <section className="main-container flex-1">
            <div className="flex w-full flex-col mx-auto max-w-4xl">
              <Tabs aria-label="Options" className="w-full ">
                <Tab key="account" title="계정">
                  <Card className="p-3">
                    <CardBody>
                      <Accordion>
                        <AccordionItem key="1" aria-label="회원 정보" title="회원 정보">
                          <div className="flex flex-col gap-2">
                            {userInfo.map((data, index) => (
                              <div key={index}>
                                <p className="my-3">{data.name}님 안녕하세요👋</p>
                                <p>이름: {data.name}</p>
                                <p>이메일: {data.email}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionItem>

                        <AccordionItem key="2" aria-label="후원 내역" title="후원 내역">
                          언제 어디에 얼마를 보냄
                        </AccordionItem>

                        <AccordionItem key="3" aria-label="회원 탈퇴" title="회원 탈퇴">
                          Bye ✋
                        </AccordionItem>
                      </Accordion>
                    </CardBody>
                  </Card>
                </Tab>
                <Tab key="subscription" title="알림">
                  <Card className="p-3">
                    <CardBody>
                      <div className="main-title">메일 설정📮</div>
                      <div className="content-box2">
                        <div className="content-title">국가 선택</div>
                        <form action="" className="content-box2">
                          {/* 첫 번째 국가 선택 */}
                          <select 
                            name="nation1" 
                            id="nation1" 
                            onChange={(e) => setNation1(e.target.value)}
                            value={nation1}
                          >
                            {nations.map((nation, idx) => (
                              <option 
                                key={idx} 
                                value={nation.value}
                                disabled={isDisabledOption(nation.value)}
                              >
                                {nation.label}
                              </option>
                            ))}
                          </select>

                          {/* 두 번째 국가 선택 */}
                          <select 
                            name="nation2" 
                            id="nation2" 
                            onChange={(e) => setNation2(e.target.value)}
                            value={nation2}
                          >
                            {nations.map((nation, idx) => (
                              <option 
                                key={idx} 
                                value={nation.value}
                                disabled={isDisabledOption(nation.value)}
                              >
                                {nation.label}
                              </option>
                            ))}
                          </select>

                          {/* 세 번째 국가 선택 */}
                          <select 
                            name="nation3" 
                            id="nation3" 
                            onChange={(e) => setNation3(e.target.value)}
                            value={nation3}
                          >
                            {nations.map((nation, idx) => (
                              <option 
                                key={idx} 
                                value={nation.value}
                                disabled={isDisabledOption(nation.value)}
                              >
                                {nation.label}
                              </option>
                            ))}
                          </select>
                        </form>
                        <div className="content-title">규모 선택</div>
                        <div className="content-box1 mx-6">
                          <div className="bgc">
                            <label htmlFor="RED" className="content-box1">
                              <p>RED</p>
                              <button className="levelbtn" onClick={toggleRedAlert} style={{ backgroundColor: redAlert ? '#006FEE' : '' , color: redAlert ? '#ffffff' : '' }}>
                                {redAlert ? "ON" : "OFF"}
                              </button>
                            </label>
                          </div>
                          <label htmlFor="ORANGE" className="content-box1">
                            <p>ORANGE</p>
                            <button className="levelbtn" onClick={toggleOrangeAlert} style={{ backgroundColor: orangeAlert ? '#006FEE' : '' , color: orangeAlert ? '#ffffff' : '' }}>
                              {orangeAlert ? "ON" : "OFF"}
                            </button>
                          </label>
                          <label htmlFor="GREEN" className="content-box1">
                            <p>GREEN</p>
                            <button className="levelbtn" onClick={toggleGreenAlert} style={{ backgroundColor: greenAlert ? '#006FEE' : '' , color: greenAlert ? '#ffffff' : '' }}>
                              {greenAlert ? "ON" : "OFF"}
                            </button>
                          </label>
                        </div>
                      </div>
                      <div className="button-box">
                        <button className="saveBtn" onClick={handleSave} disabled={loading}>저장</button>
                      </div>
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
