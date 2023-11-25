"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Viewer, Math, Cartesian3, Color, PinBuilder, VerticalOrigin, EntityCluster, Ion } from 'cesium';
import { useRouter } from 'next/navigation';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import axios from 'axios';

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZmExZTg0My0yY2RiLTQ0NDEtYTg1Mi03OTVlZDk4NDA3NGEiLCJpZCI6MTgwMTk3LCJpYXQiOjE3MDA3Mjc4NjZ9.DkUl80JHl3OeYlUA6VMWyyGbR1tc4N1seqN8jmnlMkI";

interface disasterInfo {
  dId: number;
  dType: string;
  dCountry: string;
  dStatus: string;
  dDate: string;
  dLatitude: number|null;
  dLongitude: number|null;
  dCountryLatitude: number;
  dCountryLongitude: number;
}

const EarthCesium = () => {
  const cesiumContainer = useRef(null);
  const router = useRouter();

  function getColorForDisasterType(type:any) {
    switch (type) {
      case 'Tropical Cyclone':
        return Color.RED;
      case 'Mud Slide':
        return Color.BROWN;
      case 'Flash Flood':
        return Color.DARKBLUE;
      case 'Wild Fire':
        return Color.ORANGE;
      case 'Cold Wave':
        return Color.CYAN;
      case 'Technological Disaster':
        return Color.GRAY;
      case 'Snow Avalanche':
        return Color.LIGHTSKYBLUE;
      case 'Volcano':
        return Color.DARKRED;
      case 'Fire':
        return Color.FIREBRICK;
      case 'Epidemic':
        return Color.GREENYELLOW;
      case 'Storm Surge':
        return Color.STEELBLUE;
      case 'Tsunami':
        return Color.DEEPSKYBLUE;
      case 'Insect Infestation':
        return Color.OLIVE;
      case 'Drought':
        return Color.TAN;
      case 'Earthquake':
        return Color.SIENNA;
      case 'Flood':
        return Color.NAVY;
      case 'Land Slide':
        return Color.SADDLEBROWN;
      case 'Severe Local Storm':
        return Color.DARKSLATEGRAY;
      case 'Extratropical Cyclone':
        return Color.DARKORCHID;
      case 'Heat Wave':
        return Color.RED;
      default:
        return Color.WHITE;
    }
  }

  useEffect(() => {
    let viewer:any;
    if (typeof window !== 'undefined' && cesiumContainer.current) {
      viewer = new Viewer(cesiumContainer.current,{
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
     // 클러스터링 설정
     viewer.entities.cluster = new EntityCluster({
      enabled: true,
      pixelRange: 15,
      minimumClusterSize: 3
    });

    // 클러스터링 이벤트 핸들러 설정
    viewer.entities.cluster.clusterEvent.addEventListener((clusteredEntities:any, cluster:any) => {
      cluster.label.show = true;
      cluster.billboard.show = true;
      cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;

      const pinbuilder = new PinBuilder();

      const singleDigitPins = new Array(8);
      for (let i = 0; i < singleDigitPins.length; ++i) {
        singleDigitPins[i] = pinbuilder.fromText(`${i+2}`, Color.VIOLET, 48).toDataURL();
      }

      const count = clusteredEntities.length;
      if (count < 10){
        cluster.billboard.image = singleDigitPins[count - 2];
      } else {
        cluster.billboard.image = pinbuilder.fromText("10+", getColorForDisasterType(''), 48).toDataURL();
      }
    });


      const loadData = async () => {
      try{
        const res = await axios('https://worldisaster.com/api/oldDisasters');
        const data = await res.data;
        data.forEach((item:disasterInfo,index:number)=>{
          if (typeof item.dCountryLatitude === 'number' && typeof item.dCountryLongitude === 'number'){
          let latitude = item.dCountryLatitude;
          let longitude = item.dCountryLongitude;
          viewer.entities.add({
            position: Cartesian3.fromDegrees(longitude, latitude),
            point: {
              pixelSize: 15,
              color: getColorForDisasterType(item.dType),
            },
            label: {
              Type: item.dType,
              country: item.dCountry,
              status: item.dStatus,
              data: item.dDate
            },
          });
          }
        });  
      } catch (error) {
        console.log(error)
      }
    }

    loadData();

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
  }
},[router]);

  return (
    <div id="cesiumContainer" ref={cesiumContainer}></div>
  );
};

export default EarthCesium;