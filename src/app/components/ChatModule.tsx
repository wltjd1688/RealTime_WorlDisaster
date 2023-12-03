"use client"
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { MessageList, Input, Button, Popup } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

/* 채팅 메시지의 구조 */
interface ChatMessage {
  chatSenderID: string;
  chatRoomID: string;
  chatMessage: string;
  chatMessageID: number;
  createdAt: string;
}

/* 로그인 및 유저 정보 활용을 위한 구조 */
interface User {
  name: string;
  email: string;
  provider: string;
}

/* 실제 모듈 */
const ChatModule = () => {

  const socket = io('https://worldisaster.com/alerts');

  /* React에서는 하나의 component마다 그 상태를 상징하는 State가 있음.
     useState()함수를 통해서 어떤 component에서 함수에서 사용 가능한 배열과 세팅용 함수를 추출할 수 있음 */

  const [user, setUser] = useState<User | null>(null); // 로그인된 유저 정보

  const [message, setMessage] = useState(''); // 작성중인 메시지
  const [inputKey, setInputKey] = useState(Math.random()); // input 클리어링 버그 해결

  const [chat, setChat] = useState<ChatMessage[]>([]); // 채팅 히스토리
  const [messageListArray, setMessageListArray] = useState<any>([]); // react-chat-element 전용 리스트
  const messageListRef = useRef(); // react-chat-element에서 필요한 Reference 선언

  /* 로그인 여부 확인 */
  useEffect(() => {
    const token = Cookies.get('access-token');
    if (token) {
      axios.get('https://worldisaster.com/api/auth/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error("Error fetching user info:", error);
        });
    }
  }, []);

  /* 웹소켓 연결 및 실제 메시징 기능 */
  useEffect(() => {

    /* 소켓 연결에 성공하면 로깅 및 룸 조인하기 */
    socket.on('connect', () => {
      console.log('Chats 웹소켓 연결 성공');
      socket.emit('joinRoom', 'main');
    });

    /* 채팅 히스토리를 불러오는 함수 */
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`https://worldisaster.com/api/chat/room/main/12H`);
        const initialChat = response.data;

        // setChat()을 통해서 원본을 저장하긴 하지만, 이는 추후 활용 여지가 있기 때문이지 당장 필요한건 아님
        setChat(initialChat);

        // 당장 필요한건 이 메시지를 react-chat-element에서 기대하는 배열 형태로 가공하는 것
        const transformedInitialChat = initialChat.map(transformMessage);
        setMessageListArray(transformedInitialChat);

      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    fetchChatHistory();

    /* 서버에서 newMessage 라는 제목으로 메시지를 발송, 여기서 받아서 처리 */
    socket.on('newMessage', (newMessage: ChatMessage) => {
      setChat((prevChat) => [...prevChat, newMessage]);
      const transformedMessage = transformMessage(newMessage);
      setMessageListArray((prevMessages: any) => [...prevMessages, transformedMessage]);
    });

    /* 연결이 끊기면 로그 발신 */
    socket.on('disconnect', () => {
      console.log('Disconnected from the server.');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* 채팅 스크롤 관리 */

  useEffect(() => {
    const messageList = document.querySelector('.message-list');
    if (messageList) {
      const lastMessage = messageList.querySelector('.rce-container-mbox:last-child');
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messageListArray]); // 메시지 배열이 업데이트 될 때마다 호출

  /* 여기서부터는 리턴되는 HTML 값을 위한 함수들 */

  const transformMessage = (msg: ChatMessage) => ({
    id: msg.chatMessageID,
    position: user?.name === msg.chatSenderID ? 'right' : 'left',
    type: 'text',
    title: msg.chatSenderID,
    text: msg.chatMessage,
    dateString: new Date(msg.createdAt).toLocaleString(),
  });

  const onMessageSubmit = () => {
    if (user && message) {
      const newMessage = {
        chatSenderID: user.name,
        chatRoomID: 'main',
        chatMessage: message,
      };
      socket.emit('message', newMessage);
      setMessage('');
      setInputKey(Math.random()); // 인풋 섹션만 강제 로딩 (react-chat-element 버그로 보임)

      setTimeout(() => { // input textarea에 커서를 이동
        const textarea = document.querySelector('.chat-input textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 0);
    }
  };

  /* Component 반환값 CSS 적용 */

  const chatModuleStyle: React.CSSProperties = {
    display: 'flex', // 전체 모듈을 flex로 지정
    flexGrow: 1, // 채팅 내역이 다이내믹하게 사이즈가 조정되도록
    flexDirection: 'column', // 쌓이는 방향은 아래로
    justifyContent: 'space-between', // 채팅 버블 객체간 거리
    backgroundColor: '#1c1c1c',
    color: '#f5f5f5',
    padding: '10px',
    margin: '0 auto 0 auto',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    maxWidth: '400px',
    maxHeight: '500px',
    width: '100%',
    overflow: 'auto'
  };

  const messageListStyle: React.CSSProperties = {
    whiteSpace: 'pre-wrap',
    overflowY: 'scroll', // 공간 초과시 스크롤 적용
    flexGrow: 1, // 채팅 내역이 다이내믹하게 사이즈가 조정되도록
  };

  const chatInputStyle: React.CSSProperties = {
    backgroundColor: '#262626',
    padding: '1px',
    borderRadius: '8px',
    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.5)'
  };

  const loginMessageStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#f5f5f5',
    margin: '20px 0'
  };

  const popupStyle: React.CSSProperties = {
    color: '#1c1c1c',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '90%',
    height: 'auto',
    zIndex: 500, // 맨 위에 두기
  };

  /* 채팅 내 팝업 처리 (글자수 초과) */

  const [showPopup, setShowPopup] = React.useState(false);
  const tooManyCharacters = () => {
    setShowPopup(true);
  }

  const popup = {
    show: showPopup,
    header: "Chat Limitations",
    headerButtons: [
      {
        type: "transparent",
        color: "black",
        text: "X",
        onClick: () => {
          setShowPopup(false);
        },
      },
    ],
    text: "Your chat message is too long. Please cut it down to less than 200 characters.",
    footerButtons: [
      {
        color: "white",
        backgroundColor: "green",
        text: "Okay",
        onClick: () => {
          setShowPopup(false);
        },
      },
    ]
  }

  /* Component 전체 반환값 */
  return (
    <>
      <div className='chat-module' style={chatModuleStyle}>
        <div style={messageListStyle}>
          <MessageList
            toBottomHeight={'100%'}
            className='message-list'
            referance={messageListRef}
            dataSource={messageListArray}
            lockable={true}
            messageBoxStyles={{ backgroundColor: '#333333' }} // Darker boxes for each message
            notchStyle={{ fill: '#333333' }}
          />
        </div>
        {user ? (
          <div style={chatInputStyle}>
            <Input
              key={inputKey}
              className='chat-input'
              placeholder='Type a message...'
              defaultValue=''
              multiline={true}
              maxlength={200}
              onMaxLengthExceed={tooManyCharacters}
              maxHeight={150}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              onKeyPress={(e:any) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onMessageSubmit();
                }
              }}
              rightButtons={
                <Button
                  color='white'
                  backgroundColor='#4caf50'
                  text='Send'
                  onClick={onMessageSubmit}
                />
              }
            />
          </div>
        ) : (
          <div style={loginMessageStyle}>Please log in to use the chat.</div>
        )}
      </div>
      <div style={popupStyle}>
        <Popup popup={popup} />
      </div>
    </>
  );
};

export default ChatModule;
