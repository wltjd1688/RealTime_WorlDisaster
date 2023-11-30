"use client";
import React from 'react';
import { useRecoilValue } from 'recoil';
import { dataState } from '../recoil/dataRecoil';
import Link from 'next/link';

interface DetailLeftSidebarProps {
  onClose: () => void; // onClose의 타입을 함수로 지정
  dID: string;
}

const DetailLeftSidebar: React.FC<DetailLeftSidebarProps>= ({ onClose, dID }) => {
  const data = useRecoilValue(dataState); // dataState를 data와 setData로 분리하여 사용
  const filteredData = data.filter((item) => item.dID === dID); // data에서 dID가 일치하는 데이터만 필터링

  return (
    <div className='custom-scrollbar absolute left-0 top-0 z-20 flex h-screen w-[300px] flex-col justify-between overflow-auto border-r border-r-dark-4 bg-dark-2 pb-5 pt-28 '>
      <div className='flex w-full flex-1 flex-col gap-6 px-6'>
        <div>{filteredData[0].dTitle}</div>
        <div>{filteredData[0].dCountry}</div>
        <div>{filteredData[0].dDate}</div>
        <div>{filteredData[0].dDescription}</div>
        <Link href={filteredData[0].dUrl}>{filteredData[0].dUrl}</Link>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default DetailLeftSidebar;