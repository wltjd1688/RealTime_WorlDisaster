"use client"

import React, { useState, useEffect } from 'react';
import ChatModule from './ChatModule'; // 실제 채팅 모듈 불러오기

const ChatToggleComponent = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isButtonOnly, setIsButtonOnly] = useState(true);

    /* 채팅 토글을 열면 스크롤 이동 */
    useEffect(() => {
        if (isChatOpen) {
            const messageList = document.querySelector('.message-list');
            if (messageList) {
                const lastMessage = messageList.querySelector('.rce-container-mbox:last-child');
                if (lastMessage) {
                    lastMessage.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }, [isChatOpen]);

    /* 채팅창 토글용 함수 */
    const toggleChat = () => {
        setIsChatOpen(!isChatOpen); // 채팅 창을 여는 부분
        setIsButtonOnly(!isButtonOnly); // 채팅 창을 열면서 버튼을 없애는 부분
    };

    /* 페이지 첫 로딩시 뜨는 챗 오픈 버튼 */
    const chatToggleButton1: React.CSSProperties = {
        display: isButtonOnly ? 'flex' : 'none',
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        width: '50px',
        height: '50px',
        border: 'none',
        borderRadius: '50%',
        backgroundColor: '#4A7748',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        zIndex: 100, // 맨 뒤에 있어야 함
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
    };

    /* 토글이 열린 뒤 컨테이너 안에 보이는 닫기 버튼 */
    const chatToggleButton2: React.CSSProperties = {
        position: 'absolute',
        top: '15px',
        right: '40px',
        padding: '0',
        width: '30px',
        height: '30px',
        backgroundColor: '#e57373',
        color: 'white',
        fontSize: '12px',
        lineHeight: '30px',
        textAlign: 'center',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
    };

    /* 토글되는 채팅 컨테이너용 CSS */
    const chatContainerStyle: React.CSSProperties = {
        display: isChatOpen ? 'flex' : 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'fixed', // 우측 하단에 고정
        bottom: '0',
        right: '10px',
        maxWidth: '400px',
        width: '100%',
        maxHeight: '500px',
        height: '100%',
        padding: '10px',
        zIndex: 200,
    };

    return (
        <div>
            <button onClick={toggleChat} style={chatToggleButton1}>
                💬
            </button>
            <div className={`chat-container ${isChatOpen ? 'open' : ''}`} style={chatContainerStyle}>
                <button className={`chat-toggle-button ${isButtonOnly ? 'open' : ''}`} onClick={toggleChat} style={chatToggleButton2}>
                    ❌
                </button>
                <ChatModule />
            </div>
        </div>
    );
};

export default ChatToggleComponent;

