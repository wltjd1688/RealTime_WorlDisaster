// src/app/videos/[id]/page.tsx
"use client"
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Hls from 'hls.js';
import { useRouter, useSearchParams} from 'next/navigation';

const VideoPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  // const { id } = router.query; // 동적 라우트 파라미터 'id'를 얻습니다.
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log(router);
    // router 객체가 준비되었고, 'id' 파라미터가 있는 경우에만 함수를 실행합니다.
    if (id) {
      const videoId = Array.isArray(id) ? id[0] : id; // id가 배열인 경우 첫 번째 요소를 사용합니다.
      const fetchVideo = async () => {
      const response = await fetch(`http://3.37.123.46/upload/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setVideoUrl(data.url);
      } else {
        console.error('Failed to fetch video');
      }
    };

      fetchVideo();
    }
  }, [id]); // id가 변경될 때마다 효과를 다시 실행합니다.

  useEffect(() => {
    if (Hls.isSupported() && videoUrl) {
      // console.log(Hls.isSupported());
      const video = videoRef.current;
      if (video) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });

      return () => {
        hls.destroy();
      };
    }
  }
}, [videoUrl]); // videoUrl 상태가 변경될 때마다 실행

  return (
    // <>
    //   <Head>
    //     <title>Video Test</title>
    //     <link href="https://unpkg.com/video.js/dist/video-js.css" rel="stylesheet" />
    //     <script src="https://unpkg.com/video.js/dist/video.js"></script>
    //     <script src="https://unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
    //     <script src="https://cdn.jsdelivr.net/npm/hls.js@canary"></script>
    //   </Head>
    //   <body>
    //     <video id="example-video" ref={videoRef} width="960" height="540" className="video-js vjs-default-skin" controls>
    //       <source src={videoUrl} type="application/x-mpegURL" />
    //     </video>
    //   </body>
    // </>
    
    <div>
      <video ref={videoRef} controls>
        <source src={videoUrl} type="application/x-mpegURL" />
      </video>
    </div>
  );
};

export default VideoPage;