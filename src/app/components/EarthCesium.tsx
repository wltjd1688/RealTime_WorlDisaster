"use client"
import React, { useEffect, useRef } from 'react';
import { Viewer, Math, Cartesian3, Color, PinBuilder, IonWorldImageryStyle, createWorldImageryAsync } from 'cesium';
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
    }

    // cluster 생성
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

    // 데이터 가져오기 및 point 생성
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
            // 데이터 좌표 넣기
            position: Cartesian3.fromDegrees(longitude, latitude),
            // 표지판 이미지
            billboard: {
              image: pinImage.fromColor(getColorForDisasterType(item.dType), 48).toDataURL(),
            },
            // 포인트 이미지
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
        console.log(`데이터 가져오기 성공`)  
      } catch (error) {
        console.log(`데이터 가져오기 실패: ${error}`)
      }
    }

    // 만든함수 실행
    loadData();

    // 카메라 이동시 uri에 표시되는 좌표값 변경
    viewer.camera.moveEnd.addEventListener(() => {
      const cartographicPosition = viewer.camera.positionCartographic;
      const longitude = Math.toDegrees(cartographicPosition.longitude).toFixed(6);
      const latitude = Math.toDegrees(cartographicPosition.latitude).toFixed(6);
      router.push(`/earth?lon=${longitude}&lat=${latitude}`, undefined);
    });

    // layout 추가
    createWorldImageryAsync({
      style: IonWorldImageryStyle.AERIAL_WITH_LABELS
    }).then((imageryProvider) => {
      viewer.scene.imageryLayers.addImageryProvider(imageryProvider);
      console.log(`layout추가 성공`)
    }).catch((err) => {
      console.log(`layout추가 실패: ${err}`);
    }
    );

    // viewer 정리 로직 추가
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