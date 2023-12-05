"use client";

import React, { useState } from "react";
import { Switch, Slider, Button } from "@nextui-org/react";
import { disasters } from "../constants/disaster";
import { useRecoilState } from "recoil";
import { filterState } from '../recoil/dataRecoil';


export const FilterBar = () => {
  const [filtering, setFiltering] = useRecoilState(filterState);
  const [selectDisasters, setSelectDisasters] = useState<string[]>(filtering.selectedDisaster || []);
  const [selectYear, setSelectYear] = useState<number>(filtering.selectedYear);
  const [selectLive, setSelectLive] = useState<boolean>(filtering.selectedLive);


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

  return (
    <div className='absolute top-20 right-0 flex flex-col max-w-md gap-6 px-6'>

      <div>
        <Switch isSelected={selectLive} onValueChange={handleLiveToggle} defaultSelected={selectLive} size="lg">
          <p className="text-small">
          {selectLive ? (
            <span className="text-white">실시간 재난 상황을 확인 중이에요 👀</span>
          ) : (
            <span className="text-white">Click! 현재 진행 중인 재난 상황🚨</span>
          )}
          </p>
        </Switch>
      </div>

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

      <div className="max-w-full p-3">
        <Slider 
          label="연도 별 재난 흐름 확인 🔮"
          size="sm"
          maxValue={2023}
          minValue={2000}
          getValue={(year) => `${year} / 2023`}
          value={selectYear}
          onChange={(newYear)=>{
              const year = Array.isArray(newYear) ? newYear[0] : newYear;
              handleYearChange(year);
          }}
          className="max-w-md text-white"
          isDisabled={selectLive}
        />
      </div>
    </div>
  );
};

export default FilterBar;