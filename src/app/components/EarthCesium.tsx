"use client"
import React, { useEffect, useRef } from 'react';
import { Viewer, Math } from 'cesium';
import { useRouter } from 'next/navigation';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const EarthCesium = () => {
  const cesiumContainer = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let viewer:any;
    if (typeof window !== 'undefined' && cesiumContainer.current) {
      viewer = new Viewer(cesiumContainer.current);
    }

    viewer.camera.moveEnd.addEventListener(() => {
      const cartographicPosition = viewer.camera.positionCartographic;
      const longitude = Math.toDegrees(cartographicPosition.longitude).toFixed(6);
      const latitude = Math.toDegrees(cartographicPosition.latitude).toFixed(6);

      router.push(`/earth?lon=${longitude}&lat=${latitude}`, undefined);
    });


    return () => {
      if (viewer && viewer.destroy) {
        viewer.destroy();
      }
    };
  }, [router]);

  return (
    <div id="cesiumContainer" ref={cesiumContainer}></div>
  );
};

export default EarthCesium;