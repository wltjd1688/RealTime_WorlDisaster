"use client"
import React, { useState, useEffect, useRef } from 'react';
import {Viewer, Math, Cartesian3, Color, PinBuilder, EntityCluster ,IonWorldImageryStyle, createWorldImageryAsync, CustomDataSource} from 'cesium';
import { useRouter } from 'next/navigation';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import axios from 'axios';

// Ion.defaultAccessToken = "";

interface disasterInfo {
  dId: number;
  dType: string;
  d: string;
  dStatus: string;
  dDate: string;
  dCountryLatitude: number|null;
  dCountryLongitude: number|null;
  dLatitude: number;
  dLongitude: number;
}

interface EntityClusterExtension {
  cluster: EntityCluster;
}

const EarthCesium = () => {
  const cesiumContainer = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && cesiumContainer.current) {
      let viewer = new Viewer(cesiumContainer.current,{
        animation: false,  // 애니메이션 위젯 비활성화
        baseLayerPicker: false,  // 베이스 레이어 선택기 비활성화
        fullscreenButton: false,  // 전체 화면 버튼 비활성화
        vrButton: false,  // VR 버튼 비활성화
        geocoder: false,  // 지오코더 비활성화
        homeButton: true,  // 홈 버튼 비활성화
        infoBox: false,  // 정보 박스 비활성화
        sceneModePicker: false,  // 장면 모드 선택기 비활성화
        selectionIndicator: false,  // 선택 지시기 비활성화
        timeline: false,  // 타임라인 비활성화
        navigationHelpButton: false,  // 네비게이션 도움말 버튼 비활성화
    });
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