"use client"

import '../globals.css'
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ChatToggleComponent from './ChatToggle';

export const Navbar = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get('access-token');

    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogIn = async () => {
    const token = Cookies.get('access-token');
    try {
      await axios.get('https://worldisaster.com/api/auth/google', {
        // headers: {
        //   'Authorization': `Bearer ${token}` // 헤더에 토큰 추가
        // }
      });
      setIsLoggedIn(true);
      alert('로그인 성공!');
    } catch (error) {
      console.error('LogIn failed:', error);
    }
  };

  const handleLogout = async () => {
    const token = Cookies.get('access-token');
    try {
      await axios.get('https://worldisaster.com/api/auth/logout', {
        headers: {
          'Authorization': `Bearer ${token}` // 헤더에 토큰 추가
        }
      });
      setIsLoggedIn(false);
      alert('로그아웃 성공!');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {

    const socket = io('https://worldisaster.com/alerts', {
      withCredentials: true, // CORS 문제를 해결하기 위한 옵션
      path: '/socket.io', // Sockets.io 라이브러리의 표준값
      transports: ['websocket'], // 트랜스포트 방식을 "websocket"으로 지정
    });

    socket.on('connect', () => {
      console.log('Alerts 웹소켓 연결 성공');
    });

    socket.on('disaster-alert', (message) => {
      console.log(message); // debug
      const data = JSON.parse(message);
      const result = {
        dID: data.dID, // "EQ1403291"
        dSource: data.dSource, // "GDACS"
        dStatus: data.dStatus, // "real-time"
        dAlertLevel: data.dAlertLevel, // "Green"
        dSeverity: data.dSeverity, // "Magnitude 4.5M, Depth:28.8km"
        dCountry: data.dCountry, // "United States"
        dCountryCode: data.dCountryCode, // "us"
        dCountryIso3: data.dCountryIso3, // "USA"
        dType: data.dType, // "Earthquake"
        dTypeCode: data.dTypeCode, // "EQ"
        dDate: data.dDate, // "Fri, 01 Dec 2023 17:54:39 GMT"
        dLatitude: data.dLatitude, // "52.0898"
        dLongitude: data.dLongitude, // "173.2261"
        dTitle: data.dTitle, // "Green earthquake alert (Magnitude 4.5M, Depth:28.843km) in United States 01/12/2023 17:54 UTC, Few people affected in 100km."
        dDescription: data.dDescription, // "On 12/1/2023 5:54:39 PM, an earthquake occurred in United States potentially affecting Few people affected in 100km. The earthquake had Magnitude 4.5M, Depth:28.843km."
        dUrl: data.dUrl, // "https://www.gdacs.org/report.aspx?eventtype=EQ&eventid=1403291"
        objectId: data.objectId // 177
      }

      const earthURL = `https://worldisaster.com/earth?lon=${result.dLongitude}&lat=${result.dLatitude}&height=500000&did=${result.dID}`

      interface CustomToastProps {
        dType: string;
        dCountry: string;
        dAlertLevel: string;
        earthURL: string;
      }

      const CustomToastWithLink: React.FC<CustomToastProps> = (
        { dType, dCountry, dAlertLevel, earthURL } // 여기서 dUrl 값을 추후 바꿔줘야 함 @@@@@@@
      ) => {

        const alertLevelColor =
          dAlertLevel === 'Green' ? 'green' :
            dAlertLevel === 'Orange' ? 'orange' :
              dAlertLevel === 'Red' ? 'red' :
                'blue'; // 기본색상

        return (
          <div>
            {dCountry}: new {dType}
            <span style={{ color: alertLevelColor }}> ({dAlertLevel})</span>.
            {' '}
            <Link href={earthURL}>
              <a>
                Click <span style={{ color: 'yellow' }}>HERE</span> for details.
              </a>
            </Link>
          </div>
        );
      };

      toast.warn(<CustomToastWithLink dType={result.dType} dCountry={result.dCountry} dAlertLevel={result.dAlertLevel} earthURL={earthURL} />, {
        position: "top-right",
        autoClose: 20000, // "false", integer
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark", // "light", "dark", "colored"
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <>
      <ToastContainer limit={5} />
      <ChatToggleComponent />

      <nav className='navbar'>
        <div className='flex items-center gap-5'>
          <Link href='/' className='flex items-center gap-4'>
            <Image src='/logo.svg' alt='logo' width={28} height={28} />
            <p className='text-heading3-bold text-light-1 max-xs:hidden'>WorlDisaster</p>
          </Link>
        </div>

        <div className='flex items-center gap-3'>
          {isLoggedIn ? (
            <>
              <span className='text-xl'><Link href="/support">후원</Link></span>
              <span className='text-xl'><Link href="/mypage">내 계정</Link></span>
              <span className='text-xl'>
                <a onClick={handleLogout} style={{ cursor: 'pointer' }}>로그아웃</a>
              </span>
            </>
          ) : (
            <>
              <span className='text-xl'><a href='https://worldisaster.com/api/auth/google' onClick={handleLogIn}>로그인</a></span>
            </>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar;