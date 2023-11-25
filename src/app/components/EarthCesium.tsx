"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Viewer, Math, Cartesian3, Color, IonWorldImageryStyle, createWorldImageryAsync, CustomDataSource, ScreenSpaceEventHandler, defined, ScreenSpaceEventType, Ellipsoid, Entity, JulianDate, Transforms, HeadingPitchRoll, ConstantProperty} from 'cesium';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRecoilState, } from 'recoil';
import { dataState, DataType} from '../recoil/dataRecoil';
import axios from 'axios';
import DetailLeftSidebar from './DetailLeftSidebar';
import React, { useEffect, useRef } from 'react';
import { Viewer, Math, Cartesian3, Color, IonImageryProvider, ImageryLayer } from 'cesium';
import { useRouter } from 'next/navigation';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface disasterInfoHover {
  dId: string;
  dType: string;
  dCountry: string;
  dStatus: string;
  dDate: string;
}

interface disasterInfo {
  dId: string;
  dType: string;
  dCountry: string;
  dStatus: string;
  dDate: string;
  dCountryLatitude: number|null;
  dCountryLongitude: number|null;
  dLatitude: string;
  dLongitude: string;
  objectId: number;
}


const EarthCesium = () => {
  const cesiumContainer = useRef(null);
  const router = useRouter();
  const search = useSearchParams();
  const viewerRef = useRef<Viewer|null>(null);
  const [isUserInput, setIsUserInput] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(18090749.93102962);
  const [showSidebar, setShowSidebar] = useState<Boolean>(false);
  const [data, setData] = useRecoilState(dataState); // dataState를 data와 setData로 분리하여 사용
  const [dIdValue, setDIdValue] = useState<string>('');

  // 디테일 사이드바 토글
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  }

  // 재난 타입에 따른 색상 지정
  function getColorForDisasterType(type:any) {
    switch (type) {
      case "Tropical Cyclone":
        return "RED";
      case 'Mud Slide':
        return "BROWN"; // 진흙색으로 수정
      case 'Flash Flood':
        return "DARKBLUE"; // 어두운 파랑색으로 수정
      case 'Wild Fire':
        return "ORANGE"; // 불의 색상으로 수정
      case 'Cold Wave':
        return "CYAN"; // 차가운 색상으로 수정
      case 'Technological Disaster':
        return "GRAY"; // 기술적 재난을 회색으로 표현
      case 'Snow Avalanche':
        return "LIGHTSKYBLUE"; // 눈사태에 어울리는 색상으로 수정
      case 'Volcano':
        return "DARKRED"; // 활화산을 짙은 빨강으로 표현
      case 'Fire':
        return "FIREBRICK"; // 불의 다른 색상으로 표현
      case 'Epidemic':
        return "GREENYELLOW"; // 전염병을 밝은 녹색으로 표현
      case 'Storm Surge':
        return "STEELBLUE"; // 폭풍 해일을 철색으로 표현
      case 'Tsunami':
        return "DEEPSKYBLUE"; // 쓰나미를 하늘색으로 표현
      case 'Insect Infestation':
        return "OLIVE"; // 곤충 재해를 올리브색으로 표현
      case 'Drought':
        return "TAN"; // 가뭄을 베이지색으로 표현
      case 'Earthquake':
        return "SIENNA"; // 지진을 진흙 갈색으로 표현
      case 'Flood':
        return "NAVY"; // 홍수를 진한 파랑색으로 표현
      case 'Land Slide':
        return "SADDLEBROWN"; // 산사태를 갈색으로 표현
      case 'Severe Local Storm':
        return "DARKSLATEGRAY"; // 강한 폭풍을 어두운 회색으로 표현
      case 'Extratropical Cyclone':
        return "DARKORCHID"; // 외대륙 사이클론을 어두운 보라색으로 표현
      case 'Heat Wave':
        return "RED2"; // 열파를 빨간색으로 표현      
      default:
        return "WHITE";
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && cesiumContainer.current) {
      let viewer = new Viewer(cesiumContainer.current, {
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
        creditContainer: document.createElement("none"), // 스택오버플로우 참고
      });
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 0; // 최소 확대 거리 (미터 단위)
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 18090749.93102962; // 최대 확대 거리 (미터 단위)
    viewer.scene.screenSpaceCameraController.enableTilt = true; // 휠클릭 회전 활성화 여부
    viewer.scene.screenSpaceCameraController.enableLook = true; // 우클릭 회전 활성화 여부
    viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK); // 더블클릭 이벤트 제거

    viewerRef.current = viewer;  

    // layout 추가
    createWorldImageryAsync({
      style: IonWorldImageryStyle.AERIAL_WITH_LABELS,
    }).then((imageryProvider) => {
      viewer.scene.imageryLayers.addImageryProvider(imageryProvider);
      console.log(`layout추가 성공`)
    }).catch((err) => {
      console.log(`layout추가 실패: ${err}`);
    });
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
                // 추가적인 옵션들...
      });

      viewer.entities.add({
        position: Cartesian3.fromDegrees(-75.59777, 40.03883),
        point: {
          pixelSize: 10,
          color: Color.YELLOW,
          },
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
    <>
      <div id="cesiumContainer" ref={cesiumContainer}>
        {/* <ModalComponent /> */}
      </div>
      {showSidebar && <DetailLeftSidebar onClose={toggleSidebar} dID={dIdValue} />}
    </>
  );
};

export default EarthCesium;