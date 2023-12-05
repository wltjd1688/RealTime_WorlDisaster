//../components/DidLeftSidebar.tsx
import React from 'react';
import { useRecoilValue } from 'recoil';
import { dataState } from '../recoil/dataRecoil';
import Link from 'next/link';
import DidVideo from './DidVideo';
import DidArticle from './DidAirticle';
import { Accordion, AccordionItem } from '@nextui-org/react';


interface didDetailProps {
  dID: string;
}

const DidLeftSidebar: React.FC<didDetailProps>= ({ dID }) => {
  const data = useRecoilValue(dataState); // dataState를 data와 setData로 분리하여 사용
  const filteredData = data.filter((item) => item.dID === dID); // data에서 dID가 일치하는 데이터만 필터링
  if (dID===null) return;

      
  return (
    <div className='custom-scrollbar absolute left-0 top-0 z-20 flex flex-col h-screen w-[500px] overflow-auto bg-dark-2 px-4 pb-5 pt-14'>
      <div className='text-heading3-bold text-light-1 px-3 py-6'>Disaster Detail</div>

      <div className='filterbar'>
      {filteredData.length > 0 ? (
      <div>
        <Accordion selectionMode="multiple" variant="splitted">
          <AccordionItem key="1" aria-label="Accordion 1" title="요약" className='text-black'>
            <div>{filteredData[0].dTitle}</div>
          </AccordionItem>
          <AccordionItem key="2" aria-label="Accordion 2" title="설명" className='text-black'>
            <div>{filteredData[0].dCountry}</div>
          <div>{filteredData[0].dDate}</div>
          <div>{filteredData[0].dDescription}</div>
          </AccordionItem>
          <AccordionItem key="3" aria-label="Accordion 3" title="관련 기사" className='text-black'>
            <Link target='_blank'  href={filteredData[0].dUrl}>{filteredData[0].dUrl}</Link>
            <DidArticle dID={filteredData[0].dID} />
          </AccordionItem>
          <AccordionItem key="4" aria-label="Accordion 4" title="관련 영상" className='text-black'>
            <DidVideo dID={filteredData[0].dID} />
          </AccordionItem>
        </Accordion>
      </div>
      ) : (
        <span className='flex justify-center mt-60'>Click on the Pin 👉</span>
      )}
      </div>
    </div>
  );
};

export default DidLeftSidebar;