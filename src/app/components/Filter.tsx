"use client";

import React, {useEffect, useState} from "react";
import { Accordion, AccordionItem, Switch, Slider, Autocomplete, AutocompleteItem, Button, SelectItem, Select } from "@nextui-org/react";
import { nations } from "../constants/nation";
import { disasters } from "../constants/disaster";
import { useRecoilState } from "recoil";
import { dataState, DataType, filterState, FilterType} from '../recoil/dataRecoil';
import { set } from "video.js/dist/types/tech/middleware";

export const FilterBar = () => {
  const [filtering, setFiltering] = useRecoilState(filterState);
  const [selectCountry, setSelectCountry] = useState<string|null>(filtering.selectedCountry);
  const [selectDisasters, setSelectDisasters] = useState<string[]>(filtering.selectedDisaster || []);
  const [selectYear, setSelectYear] = useState<number>(filtering.selectedYear);
  const [selectLive, setSelectLive] = useState<boolean>(filtering.selectedLive);

  // 국가 선택 핸들러
  const handleCountrySelect = (contury: string) => {
    setSelectCountry(contury);
    setFiltering({...filtering, selectedCountry:contury});
  };

  // 재난 유형 선택 핸들러
  const handleDisasterSelect = (disasterType: string) => {
    const updatedDisasters = selectDisasters.includes(disasterType)
      ? selectDisasters.filter(type => type !== disasterType)
      : [...selectDisasters, disasterType];
    setSelectDisasters(updatedDisasters);
    setFiltering({ ...filtering, selectedDisaster: updatedDisasters });
  };

  // 연도 선택 핸들러
  const handleYearChange = (year: number) => {
    setSelectYear(year);
    setFiltering({ ...filtering, selectedYear: year });
  };

  // 실시간 상태 토글 핸들러
  const handleLiveToggle = (isLive: boolean) => {
    setSelectLive(isLive);
    if (isLive){
      setFiltering({ ...filtering, selectedLive: isLive, selectedYear: 2023 });
    } else {
      setFiltering({ ...filtering, selectedLive: isLive });
    }
  };

  useEffect(() => {
    console.log(filtering);
  },[filtering])


  return (
    <div className=' absolute bottom-0 flex w-full flex-1 flex-col gap-6 px-6'>
      <Accordion variant="splitted">
        <AccordionItem key="1" aria-label="Accordion 1" title="검색을 통해 국가로 이동">
          <Select
            variant="underlined"
            label="국가로 바로 이동해 보세요! ✈️"
            placeholder="Search a nation"
            className="max-w-xs pb-3"
            value={selectCountry ||""}
            onChange={(e)=>{handleCountrySelect(e.target.value)}}
            >
            {nations.map((nation) => (
              <SelectItem key={nation.value} value={nation.value} className="text-black">
                {nation.label}
              </SelectItem>
            ))}
          </Select>
        </AccordionItem>
        <AccordionItem key="2" aria-label="Accordion 2" title="태그를 통해 재난 필터링">
          <div className="flex gap-3 flex-wrap">
            {disasters.map((disaster) => (
                <Button 
                  key={disaster.type} 
                  color="primary" 
                  size="sm" 
                  radius="full"
                  variant={!selectDisasters.includes(disaster.type) ? undefined:"bordered"}
                  onClick={() => handleDisasterSelect(disaster.type)}
                >
                {disaster.type}
              </Button>
            ))}
          </div>
        </AccordionItem>
        <AccordionItem key="3" aria-label="Accordion 3" title="토글을 통해 끝나지 않은 재난 따로 확인">
          <div className="text-black">
            <Switch isSelected={selectLive} onValueChange={handleLiveToggle} defaultSelected={selectLive} size="lg">
              <p className="text-small">
              {selectLive ? (
                <span>실시간 재난 상황을 확인 중이에요 👀</span>
              ) : (
                <span>Click! 현재 진행 중인 재난 상황🚨</span>
              )}
              </p>
            </Switch>
          </div>
        </AccordionItem>
        <AccordionItem key="4" aria-label="Accordion 4" title="드래그 바를 통해 연도 별 흐름 확인">
          <div className="max-w-full p-3">
            <Slider 
              label="연도 별 재난 흐름 확인 🔮"
              size="sm"
              maxValue={2023}
              minValue={2000}
              getValue={(year) => `${year} / 2023`}
              value={selectYear}
              onChange={(newYear)=>{
                // value가 배열인 경우 첫 번째 요소 사용, 아닐 경우 그대로 사용
                  const year = Array.isArray(newYear) ? newYear[0] : newYear;
                  handleYearChange(year);
              }}
              className="max-w-md text-black"
              isDisabled={selectLive}
            />
          </div>
        </AccordionItem>
      </Accordion>
      </div>
  );
};

export default FilterBar;