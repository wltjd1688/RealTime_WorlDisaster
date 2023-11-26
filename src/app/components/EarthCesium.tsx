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
  dLatitude: number|null;
  dLongitude: number|null;
  dLatitude: number;
  dLongitude: number;
}

interface EntityClusterExtension {
  cluster: EntityCluster;
}

const EarthCesium = () => {
  const cesiumContainer = useRef(null);
  const router = useRouter();
  const viewerRef = useRef<Viewer|null>(null);

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
        // navigationInstructionsInitiallyVisible?: boolean;
        // scene3DOnly?: boolean;
        // shouldAnimate?: boolean;
        // clockViewModel?: ClockViewModel;
        // selectedImageryProviderViewModel?: ProviderViewModel;
        // imageryProviderViewModels?: ProviderViewModel[];
        // selectedTerrainProviderViewModel?: ProviderViewModel;
        // terrainProviderViewModels?: ProviderViewModel[];
        // baseLayer?: ImageryLayer | false;
        // terrainProvider?: TerrainProvider;
        // terrain?: Terrain;
        // skyBox?: SkyBox | false;
        // skyAtmosphere?: SkyAtmosphere | false;
        // fullscreenElement?: Element | string;
        // useDefaultRenderLoop?: boolean;
        // targetFrameRate?: number;
        // showRenderLoopErrors?: boolean;
        // useBrowserRecommendedResolution?: boolean;
        // automaticallyTrackDataSourceClocks?: boolean;
        // contextOptions?: ContextOptions;
        // sceneMode?: SceneMode;
        // mapProjection?: MapProjection;
        // globe?: Globe | false;
        // orderIndependentTranslucency?: boolean;
        // creditContainer?: Element | string;
        // creditViewport?: Element | string;
        // dataSources?: DataSourceCollection;
        // shadows?: boolean;
        // terrainShadows?: ShadowMode;
        // mapMode2D?: MapMode2D;
        // projectionPicker?: boolean;
        // blurActiveElementOnCanvasFocus?: boolean;
        // requestRenderMode?: boolean;
        // maximumRenderTimeChange?: number;
        // depthPlaneEllipsoidOffset?: number;
        // msaaSamples?: number;
      });

    viewerRef.current = viewer;  

    // layout 추가
    createWorldImageryAsync({
      style: IonWorldImageryStyle.AERIAL_WITH_LABELS
    }).then((imageryProvider) => {
      viewer.scene.imageryLayers.addImageryProvider(imageryProvider);
      console.log(`layout추가 성공`)
    }).catch((err) => {
      console.log(`layout추가 실패: ${err}`);
    });

    // viewer 정리 로직 추가
    return () => {
      if (viewer && viewer.destroy) {
        viewer.destroy();        
      }
    };
  }
},[]);

useEffect(() => {
  const viewer = viewerRef.current;
  if(!viewer || !viewer.scene || !viewer.camera) {
    return;
  };

  const customDataSource = new CustomDataSource('Disasters');

  customDataSource.clustering = new EntityCluster({
    enabled: true,
    pixelRange: 20,
    minimumClusterSize: 3,
    clusterBillboards: true,
    clusterLabels: true,
    clusterPoints: true,
  })

  customDataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
    let count = clusteredEntities.length;

    if (count >= 50) {
      cluster.billboard.image = pin50;
    } else if (count >= 40) {
      cluster.billboard.image = pin40;
    } else if (count >= 30) {
      cluster.billboard.image = pin30;
    } else if (count >= 20) {
      cluster.billboard.image = pin20;
    } else if (count >= 10) {
      cluster.billboard.image = pin10;
    } else if (count >= 5) {
      cluster.billboard.image = pin5;
    } else {
      cluster.billboard.image = singleDigitPins[count];
    }
  })

  const pinBuilder = new PinBuilder();
    const pin50 = pinBuilder.fromText('50+', Color.RED, 48).toDataURL();
    const pin40 = pinBuilder.fromText('40+', Color.ORANGE, 48).toDataURL();
    const pin30 = pinBuilder.fromText('30+', Color.YELLOW, 48).toDataURL();
    const pin20 = pinBuilder.fromText('20+', Color.GREEN, 48).toDataURL();
    const pin10 = pinBuilder.fromText('10+', Color.BLUE, 48).toDataURL();
    const pin5 = pinBuilder.fromText('5+', Color.PURPLE, 48).toDataURL();
    const singleDigitPins = new Array(10);
    for (let i = 0; i < singleDigitPins.length; ++i) {
      singleDigitPins[i] = pinBuilder.fromText(String(i), Color.VIOLET, 48).toDataURL();
    }

  // cluster pinBuild
  const loadData = async (viewer:Viewer) => {
    const pinimage = new PinBuilder();
    try{
      const res = await axios('https://worldisaster.com/api/oldDisasters');
      const data = await res.data;

      data.forEach((item:disasterInfo)=>{
        if (typeof item.dLatitude === 'number' && typeof item.dLongitude === 'number'){
        let latitude = item.dLatitude;
        let longitude = item.dLongitude;
        customDataSource.entities.add({
          // 데이터 좌표 넣기
          position: Cartesian3.fromDegrees(longitude, latitude),
          // 표지판 이미지
          billboard: {
            image: pinimage.fromText(`${1}`,getColorForDisasterType(item.dType), 48).toDataURL(), // 표지판 이미지
          },
          // 포인트 이미지
          // point: {
          //   pixelSize: 20,
          //   color: getColorForDisasterType(item.dType),
          // },
        });
        }
      });
      console.log(`데이터 로드 성공`);
      console.log(data)
    } catch(err) {
      console.log('데이터 로드 실패', err);
    }
  }
  loadData(viewer);

  viewer.dataSources.add(customDataSource);

},[]);

useEffect(() => {
  const viewer = viewerRef.current;
  if(!viewer || !viewer.scene || !viewer.camera) {
    return;
  };

  const moveEndListener = viewer.camera.moveEnd.addEventListener(() => {
      const cartographicPosition = viewer.camera.positionCartographic;
      const longitude = Math.toDegrees(cartographicPosition.longitude).toFixed(6);
      const latitude = Math.toDegrees(cartographicPosition.latitude).toFixed(6);
      router.push(`/earth?lon=${longitude}&lat=${latitude}`, undefined);
  });

  return () => {
    moveEndListener();
  };
}, [router]);

  return (
    <div id="cesiumContainer" ref={cesiumContainer}></div>
  );
};

export default EarthCesium;