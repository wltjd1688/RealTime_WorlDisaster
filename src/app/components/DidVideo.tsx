import videojs from "video.js";
import "video.js/dist/video-js.css";
import React, { useEffect, useRef, useState } from "react";

interface DidVideoProps {
  dID: string;
}

export const DidVideo: React.FC<DidVideoProps> = ({ dID }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchVideoUrls() {
      setLoading(true);
      setError("");
      if (!dID) return;
      try {
        const response = await fetch(`https://worldisaster.com/api/upload/${dID}`);
        const data = await response.json();
        if (data.urls && data.urls.length > 0) {
          setVideoUrls(data.urls);
          setCurrentVideoUrl(data.urls[0]);
        } else {
          setError("동영상이 없습니다.");
        }
      } catch (e) {
        setError("동영상을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchVideoUrls();
  }, [dID]);

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
      {error && <div>{error}</div>}
      {!loading && !error && (
        <video autoPlay loop controls ref={videoRef} className="video-js !w-full" />
      )}
    </div>
  );
};

export default DidVideo;
