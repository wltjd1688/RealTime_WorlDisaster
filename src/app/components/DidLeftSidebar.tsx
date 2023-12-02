//../components/DidLeftSidebar.tsx
import React from 'react';
import { useRecoilValue } from 'recoil';
import { dataState } from '../recoil/dataRecoil';
import Link from 'next/link';
import DidVideo from './DidVideo';
import DidArticle from './DidAirticle';


interface didDetailProps {
  onClose: () => void; // onClose의 타입을 함수로 지정
  dID: string;
}

const DidLeftSidebar: React.FC<didDetailProps>= ({ onClose, dID }) => {
  const data = useRecoilValue(dataState); // dataState를 data와 setData로 분리하여 사용
  const filteredData = data.filter((item) => item.dID === dID); // data에서 dID가 일치하는 데이터만 필터링

      
  return (
    <div className='custom-scrollbar absolute left-0 top-0 z-20 flex h-screen w-[300px] flex-col justify-between overflow-auto border-r border-r-dark-4 bg-dark-2 pb-5 pt-14'>
      <div className='flex justify-between items-center px-6'>
        <div className='text-heading3-bold text-light-1'>Disaster Detail</div>
        <button onClick={onClose}>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-light-1 hover:text-light-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      </div>
      <div className=''></div>
      <div className='flex w-full flex-1 flex-col gap-6 px-6'>
        <div>{filteredData[0].dTitle}</div>
        <div>{filteredData[0].dCountry}</div>
        <div>{filteredData[0].dDate}</div>
        <div>{filteredData[0].dDescription}</div>
        <Link href={filteredData[0].dUrl}>{filteredData[0].dUrl}</Link>
        <DidVideo dID={filteredData[0].dID} />
        <DidArticle dID={filteredData[0].dID} />
      </div>
    </div>
  );
};

export default DidLeftSidebar;