"use client";

interface DetailLeftSidebarProps {
  onClose: () => void; // onClose의 타입을 함수로 지정
}

const DetailLeftSidebar: React.FC<DetailLeftSidebarProps>= ({ onClose }) => {

  return (
    <div className='custom-scrollbar absolute left-0 top-0 z-20 flex h-screen w-[300px] flex-col justify-between overflow-auto border-r border-r-dark-4 bg-dark-2 pb-5 pt-28 '>
      <div className='flex w-full flex-1 flex-col gap-6 px-6'>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default DetailLeftSidebar;