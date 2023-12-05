"use client"

import '../globals.css'
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { userLoginState } from '../recoil/dataRecoil';
// import { showRightSidebarState } from '../recoil/dataRecoil';
import Cookies from 'js-cookie';
import axios from 'axios'

// 네비게이션 바
export const Navbar = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginState, setLoginState] = useRecoilState(userLoginState);
  // const setShowRightSidebar = useSetRecoilState(showRightSidebarState);

  // // 🔄 사이드바를 열고 닫는 함수
  // const openRightSidebar = () => {
  //   setShowRightSidebar(true);
  // };

  // 🔄 토큰이 있으면 로그인 상태로 바꾸는 함수
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get('access-token');
      if (token) {
        try {
          const response = await axios.get('https://worldisaster.com/api/auth/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setLoginState({ isLoggedIn: true, userInfo: response.data });
          console.log('로그인 정보 주세요',response);
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, [setLoginState]);

  // 📌 로그아웃 클릭 시 get 요청
  const handleLogout = async () => {
    const token = Cookies.get('access-token');
    try {
      await axios.get('https://worldisaster.com/api/auth/logout', {
        headers: {
          'Authorization': `Bearer ${token}` // 헤더에 토큰 추가
        }
      });
      setLoginState({ isLoggedIn: false, userInfo: null });
      alert('로그아웃 성공!');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <nav className='navbar'>
        <div className='flex items-center'>
          <Link href='/' className='flex items-center gap-3'>
            <Image src='logo.svg' alt='logo' width={30} height={30} />
            <p className='text-heading3-bold text-light-1 max-xs:hidden'>WorlDisaster</p>
          </Link>
          {/* <button onClick={openRightSidebar} className="px-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className='h-6 w-6 text-light-1 hover:text-light-2' viewBox="0 0 16 16">
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
            </svg>
          </button> */}
        </div>

        <div className='flex items-center gap-3'>
          {loginState.isLoggedIn ? (
            <>
              <span className='text-xl'><Link href="/support">후원</Link></span>
              <span className='text-xl'><Link href="/mypage">내 계정</Link></span>
              <span className='text-xl'>
                <a onClick={handleLogout} style={{ cursor: 'pointer' }}>로그아웃</a>
              </span>
            </>
          ) : (
            <>
              <span className='text-xl'><a href='https://worldisaster.com/api/auth/google'>로그인</a></span>
            </>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar;