"use client"

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  NextUIProvider,
  Tabs,
  Tab,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
  Switch,
} from "@nextui-org/react";
import Cookies from "js-cookie";
import axios from "axios";
import nations from "../constants/nations";
import levels from "../constants/alertlevel";
import "../globals.css";

interface Nation {
  name: string;
  email: string;
  provider: string;
}

interface MypageProps {}

const MAX_SELECTION = 3;

const Mypage: React.FC<MypageProps> = () => {

  const [loading, setLoading] = useState(false); // 서버 응답 대기 중 여부를 나타내는 상태 추가

  const [nationElem, setNationElem] = useState<Nation[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("access-token");
    const getNationElem = async () => {
      try {
        const response = await axios.get<Nation>(
          "https://worldisaster.com/api/auth/info",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          setNationElem([response.data]);
        } else {
          setNationElem([]);
        }
      } catch (error) {
        console.log("Failed to retrieve nation data", error);
        setNationElem([]);
      }
    };
    getNationElem();
  }, [pathname]);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedNations, setSelectedNations] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("access-token");
        const response = await axios.get<Nation>("https://worldisaster.com/api/auth/info",{
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
  }, [isSubscribed, selectedNations, selectedLevels]);

  const handleNationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNation = event.target.value;

    if (selectedNation === "all") {
      setSelectedNations(["all"]);
    } else {
      if (selectedNations.includes("all")) {
        setSelectedNations([selectedNation]);
      } else {
        if (selectedNations.length < MAX_SELECTION) {
          setSelectedNations((prevSelected) => [...prevSelected, selectedNation]);
        } else {
          console.warn("최대 선택 가능한 국가 수를 초과했습니다.");
        }
      }
    }
  };

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLevel = event.target.value;

    if (selectedLevel === "all") {
      setSelectedLevels(["all"]);
    } else {
      if (selectedLevels.includes("all")) {
        setSelectedLevels([selectedLevel]);
      } else {
        if (selectedLevels.length < MAX_SELECTION) {
          setSelectedLevels((prevSelected) => [...prevSelected, selectedLevel]);
        } else {
          console.warn("최대 선택 가능한 규모 수를 초과했습니다.");
        }
      }
    }
  };

  const handleRemoveNation = (nation: string) => {
    setSelectedNations((prevSelected) => prevSelected.filter((item) => item !== nation));
  };

  const handleRemoveLevel = (level: string) => {
    setSelectedLevels((prevSelected) => prevSelected.filter((item) => item !== level));
  };

  useEffect(() => {
    // 'all'이 규모로 선택된 경우, 선택된 국가를 비웁니다.
    if (selectedLevels.includes("all")) {
      setSelectedNations([]);
    }
  }, [selectedLevels]);

  const [subscriptionData, setSubscriptionData] = useState({
    success: false,
    subscription: "off",
    subscriptionLevel_Green: "off",
    subscriptionLevel_Orange: "off",
    subscriptionLevel_Red: "off",
    subscriptionCountry1: "",
    subscriptionCountry2: "",
    subscriptionCountry3: "",
  });

  const handleSaveSettings = async () => {
    const token = Cookies.get("access-token");

    try {
      setLoading(true); // 서버 응답 대기 중임을 나타내는 상태 업데이트

      const response = await axios.post(
        "https://worldisaster.com/api/auth/info",
        {
          isSubscribed,
          selectedNations,
          selectedLevels,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("설정이 성공적으로 저장되었습니다:", response.data);

      // POST 요청 이후에 서버로부터 응답이 오면 subscriptionData 상태 업데이트
      setSubscriptionData(response.data);
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
                            {nationElem.map((data, index) => (
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
                      <div>
                        <div className="main-title">메일 설정📮</div>
                        <div className="content-box1">
                          <div>
                            <p className="content-title">모든 국가 재난 알림 및 이메일 발송</p>
                            <p className="content-subtitle">새로 업데이트된 모든 재난 정보 알림을 받습니다.</p>
                          </div>
                          <div className="flex flex-row items-center">
                            <Switch
                              isSelected={isSubscribed}
                              onValueChange={(value) => {
                                console.log(value);
                                setIsSubscribed(value);
                              }}
                            ></Switch>
                            <p>{isSubscribed ? "ON" : "OFF"}</p>
                          </div>
                        </div>

                        {!isSubscribed && (
                          <div className="content-box2">
                            <div>
                              <div className="content-title">잠깐 ! 제가 원하는 정보만 받을게요 ✋</div>
                              <div className="content-subtitle">
                                새로 업데이트된 모든 재난 중 <span className="border">설정한</span> 재난 정보 알림만 받습니다.
                              </div>
                            </div>
                            <div className="select-box">
                              <div className="content-title">국가 선택</div>
                              <form action="#">
                                <select
                                  name="selectedNations"
                                  id="selectedNations"
                                  onChange={handleNationChange}
                                  value={selectedNations}
                                  multiple
                                >
                                  {nations.map((nation) => (
                                    <option key={nation.value} value={nation.value}>
                                      {nation.label}
                                    </option>
                                  ))}
                                </select>
                              </form>
                              <div className="select-content">
                                {selectedNations.map((nation) => (
                                  <div key={nation} className="select-item" onClick={() => handleRemoveNation(nation)}>
                                    <span>{nation} </span>
                                    <span>x</span>
                                  </div>
                                ))}
                              </div>

                              <div className="content-title">규모 선택</div>
                              <form action="#">
                                <select
                                  name="selectedLevels"
                                  id="selectedLevels"
                                  onChange={handleLevelChange}
                                  value={selectedLevels}
                                  multiple
                                >
                                  {levels.map((level) => (
                                    <option key={level.value} value={level.value}>
                                      {level.label}
                                    </option>
                                  ))}
                                </select>
                              </form>
                              <div className="select-content">
                                {selectedLevels.map((level) => (
                                  <div key={level} className="select-item" onClick={() => handleRemoveLevel(level)}>
                                    <span>{level} </span>
                                    <span>x</span>
                                  </div>
                                ))}
                              </div>
                              <button className="mybtn" onClick={handleSaveSettings} disabled={loading}>설정 완료</button>
                            </div>
                          </div>
                        )}
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
