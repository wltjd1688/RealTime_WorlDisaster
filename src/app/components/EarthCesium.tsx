"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Viewer, Math, Cartesian3, Color, PinBuilder, VerticalOrigin, EntityCluster, ImageryLayer, IonWorldImageryStyle } from 'cesium';
import { useRouter } from 'next/navigation';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import axios from 'axios';


// Ion.defaultAccessToken = "";

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
      case "Tropical Cyclone":
        return Color.RED;
      case 'Mud Slide':
        return Color.BROWN; // 진흙색으로 수정
      case 'Flash Flood':
        return Color.DARKBLUE; // 어두운 파랑색으로 수정
      case 'Wild Fire':
        return Color.ORANGE; // 불의 색상으로 수정
      case 'Cold Wave':
        return Color.CYAN; // 차가운 색상으로 수정
      case 'Technological Disaster':
        return Color.GRAY; // 기술적 재난을 회색으로 표현
      case 'Snow Avalanche':
        return Color.LIGHTSKYBLUE; // 눈사태에 어울리는 색상으로 수정
      case 'Volcano':
        return Color.DARKRED; // 활화산을 짙은 빨강으로 표현
      case 'Fire':
        return Color.FIREBRICK; // 불의 다른 색상으로 표현
      case 'Epidemic':
        return Color.GREENYELLOW; // 전염병을 밝은 녹색으로 표현
      case 'Storm Surge':
        return Color.STEELBLUE; // 폭풍 해일을 철색으로 표현
      case 'Tsunami':
        return Color.DEEPSKYBLUE; // 쓰나미를 하늘색으로 표현
      case 'Insect Infestation':
        return Color.OLIVE; // 곤충 재해를 올리브색으로 표현
      case 'Drought':
        return Color.TAN; // 가뭄을 베이지색으로 표현
      case 'Earthquake':
        return Color.SIENNA; // 지진을 진흙 갈색으로 표현
      case 'Flood':
        return Color.NAVY; // 홍수를 진한 파랑색으로 표현
      case 'Land Slide':
        return Color.SADDLEBROWN; // 산사태를 갈색으로 표현
      case 'Severe Local Storm':
        return Color.DARKSLATEGRAY; // 강한 폭풍을 어두운 회색으로 표현
      case 'Extratropical Cyclone':
        return Color.DARKORCHID; // 외대륙 사이클론을 어두운 보라색으로 표현
      case 'Heat Wave':
        return Color.RED; // 열파를 빨간색으로 표현      
      default:
        return Color.WHITE;
    }
  }
  

  useEffect(() => {
    if (typeof window !== 'undefined' && cesiumContainer.current) {
      viewer = new Viewer(cesiumContainer.current,{
        // 여기에 옵션을 설정합니다.
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
        baseLayer: ImageryLayer.fromWorldImagery({
          style: IonWorldImageryStyle.AERIAL_WITH_LABELS,
        }),
        // 추가적인 옵션들...
      });
    }

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
          const pinImage = new PinBuilder();
          const res = await axios('https://worldisaster.com/api/oldDisasters');
          const data = await res.data;
          data.forEach((item:disasterInfo,index:number)=>{
            if (typeof item.dCountryLatitude === 'number' && typeof item.dCountryLongitude === 'number'){
            let latitude = item.dCountryLatitude;
            let longitude = item.dCountryLongitude;
            viewer.entities.add({
              position: Cartesian3.fromDegrees(longitude, latitude),
              billboard: {
                image: pinImage.fromColor(getColorForDisasterType(item.dType), 48).toDataURL(),
              },
              // point: {
              //   pixelSize: 20,
              //   color: getColorForDisasterType(item.dType),
              // },
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
  
},[router]);

  return (
    <div id="cesiumContainer" ref={cesiumContainer}></div>
  );
};

export default EarthCesium;