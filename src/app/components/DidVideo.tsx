import React, { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { Button } from "@nextui-org/react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { setFormatTime } from "video.js/dist/types/utils/time";
interface DidVideoProps {
  dID: string;
}

export const DidVideo: React.FC<DidVideoProps> = ({ dID }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>("");
  const [videoError, setVideoError] = useState<string>("");

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
  
      // 파일 크기가 10MB 이상인지 확인 (10MB = 10 * 1024 * 1024 바이트)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('파일 크기가 10MB를 초과합니다.');
        return;
      }
  
      // 파일 이름 길이가 12자 이상인지 확인
      if (file.name.length > 12) {
        setFileError('파일 이름 길이가 12자를 초과합니다.');
        return;
      }
  
      // 파일 및 파일 이름 설정
      setFile(file);
      setFileName(file.name);
      setFileError(''); // 이전 오류 메시지 초기화
    }
  };
  

  const DropCancel = () => {
    setFile(null);
    setFileName("");
  };

  const uploadVideo = async () => {
    if (!file) {
      setFileError('파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
      formData.append("file", file);
      

      setLoading(true);
      setFileError('');

      try {
        const response = await axios.post(`https://worldisaster.com/api/upload/${dID}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }, timeout: 30000
        });
        console.log(response.data);
        setVideoError('업로드가 완료되었습니다.');
      } catch (error:any) {
        if (error.code === 'ECONNABORTED') {
          console.error("업로드 시간 초과",error);
          setVideoError('업로드 시간이 초과되었습니다.');
        } else {
          console.error("업로드 실패", error);
          setVideoError('업로드 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
        alert(videoError)
      }
    };

  useEffect(() => {
    async function VideoUrls() {
      setLoading(true);
      setVideoError("");
      if (!dID) return;
      try {
        const response = await axios(`https://worldisaster.com/api/upload/${dID}`, {timeout: 5000});
        const data = response.data;
        if (data.urls && data.urls.length > 0) {
          setVideoUrls(data.urls);
          setCurrentVideoUrl(data.urls[0]);
        } else {
          setVideoError("동영상이 없습니다.");
        }
      } catch (err) {
        setVideoError("동영상을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    VideoUrls();
  }, [dID]);

  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => {
        setFileError('');
      }, 7000);
  
      return () => clearTimeout(timer);
    }
  }, [fileError]); // fileError가 변경될 때마다 이 효과가 실행됨
  

  useEffect(() => {
    if (videoRef.current && currentVideoUrl) {
      videojs(videoRef.current, {
        sources: [
          {
            src: currentVideoUrl,
            type: "application/x-mpegURL",
          },
        ],
      });
    }
  }, [currentVideoUrl]);

  return (
    <div>
      {loading && <div>동영상 불러오는 중...</div>}
      {videoError && <div>{videoError}</div>}
      {!loading && !videoError && (
        <video autoPlay loop controls ref={videoRef} className="video-js !w-[100%]" />
      )}
      {fileError && <div>{fileError}</div>}
      <div
        className=" rounded-lg bg-white text-black w-full h-20 flex justify-center items-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {fileName ? 
        <>
        선택된 파일: {fileName}
          <div className="m-2" onClick={DropCancel}>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-black hover:text-gray-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </div>
        </>: '비디오 파일을 여기에 드래그하세요'}
      </div>
      <Button onClick={uploadVideo}>업로드</Button>
    </div>
  );
};

export default DidVideo;
