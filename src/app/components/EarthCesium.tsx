"use client"
import React, { useState, useEffect, useRef } from 'react';
import {Viewer, Math, Cartesian3, Color, PinBuilder, EntityCluster ,IonWorldImageryStyle, createWorldImageryAsync, CustomDataSource, VerticalOrigin, NearFarScalar, ScreenSpaceEventHandler, defined, ScreenSpaceEventType} from 'cesium';
import { useRouter, useSearchParams } from 'next/navigation';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import axios from 'axios';

// Ion.defaultAccessToken = "";

interface disasterInfo {
  dId: string;
  dType: string;
  dCountry: string;
  dStatus: string;
  dDate: string;
  dCountryLatitude: number|null;
  dCountryLongitude: number|null;
  dLatitude: number;
  dLongitude: number;
  objectId:number;
}

const EarthCesium = () => {
  const cesiumContainer = useRef(null);
  const router = useRouter();
  const search = useSearchParams();
  const viewerRef = useRef<Viewer|null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<disasterInfo|null>(null);
  const [isUserInput, setIsUserInput] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(18090749.93102962);

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
        selectionIndicator: true,  // 선택 지시기 비활성화
        timeline: false,  // 타임라인 비활성화
        navigationHelpButton: false,  // 네비게이션 도움말 버튼 비활성화
        creditContainer: document.createElement("none"), // 스택오버플로우 참고
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
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 0; // 최소 확대 거리 (미터 단위)
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 18090749.93102962; // 최대 확대 거리 (미터 단위)
    viewer.scene.screenSpaceCameraController.enableTilt = true; // 기울기
      

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

  // customDataSource.clustering = new EntityCluster({
  //   enabled: true,
  //   pixelRange: 100,
  //   minimumClusterSize: 2,
  //   clusterBillboards: true,
  //   clusterLabels: true,
  //   clusterPoints: true,
  // });

  // const pinBuilder = new PinBuilder();
  // const pin50 = pinBuilder.fromText('50+', Color.RED, 48).toDataURL();
  // const pin40 = pinBuilder.fromText('40+', Color.ORANGE, 48).toDataURL();
  // const pin30 = pinBuilder.fromText('30+', Color.YELLOW, 48).toDataURL();
  // const pin20 = pinBuilder.fromText('20+', Color.GREEN, 48).toDataURL();
  // const pin10 = pinBuilder.fromText('10+', Color.BLUE, 48).toDataURL();
  // const pin5 = pinBuilder.fromText('5+', Color.PURPLE, 48).toDataURL();
  // const singleDigitPins = new Array(10);
  // for (let i = 0; i < singleDigitPins.length; ++i) {
  //   singleDigitPins[i] = pinBuilder.fromText(String(i), Color.VIOLET, 48).toDataURL();
  // };

  // customDataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
  //   let count = clusteredEntities.length;
  //     cluster.billboard.show = true;
  //     cluster.label.show = false;
  //     cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;

  //   if (count >= 50) {
  //     cluster.billboard.image = pin50;
  //   } else if (count >= 40) {
  //     cluster.billboard.image = pin40;
  //   } else if (count >= 30) {
  //     cluster.billboard.image = pin30;
  //   } else if (count >= 20) {
  //     cluster.billboard.image = pin20;
  //   } else if (count >= 10) {
  //     cluster.billboard.image = pin10;
  //   } else if (count >= 5) {
  //     cluster.billboard.image = pin5;
  //   } else {
  //     cluster.billboard.image = singleDigitPins[count];
  //   }
  // })

  // cluster pinBuild
  const loadData = async (viewer:Viewer) => {
    try{
      const res = await axios('https://worldisaster.com/api/oldDisasters');
      const data = await res.data;
      data.forEach((item:disasterInfo)=>{
        if (typeof item.dLatitude === 'number' && typeof item.dLongitude === 'number'){
        let latitude = item.dLatitude;
        let longitude = item.dLongitude;
        let textlength = item.dType.length;
        customDataSource.entities.add({
          id: item.dId,
          // 데이터 좌표 넣기
          position: Cartesian3.fromDegrees(longitude, latitude),
          // 표지판 이미지
          // billboard: {
          //   image: pinBuilder.fromText(`${1}`,getColorForDisasterType(item.dType), 48).toDataURL(), // 표지판 이미지
          // },
          //포인트 이미지
          point: {
            pixelSize: 1,
            color: getColorForDisasterType(item.dType),
            scaleByDistance: new NearFarScalar(250000, 50, 10e6, 2)
          },
          // 라벨
          // label: {
          //   text: item.dType,
          //   font: '14pt monospace',
          //   outlineWidth: 2,
          //   verticalOrigin: VerticalOrigin.BOTTOM,
          //   pixelOffset: new Cartesian3(50 + (textlength*3)*1.4, 9, 0),
          //   translucencyByDistance: new NearFarScalar(9e6, 1.0, 10e6, 0.0),
          //   eyeOffset: new Cartesian3(0, 0, -100),
          // },
          properties: item,
        });
        }
      });
      console.log(`데이터 로드 성공`);
    } catch(err) {
      console.log('데이터 로드 실패', err);
    }
  }

  loadData(viewer);

  viewer.dataSources.add(customDataSource);

},[]);

useEffect(() => {
  const viewer = viewerRef.current;
  if (!viewer || !viewer.scene || !viewer.camera) {
    return;
  }

  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click:any) => {
    const pickedObject = viewer.scene.pick(click.position);
    if (defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
      const properties = pickedObject.id.properties;
      const disasterData = {
        dId: properties._dID?._value,
        dType: properties._dType?._value,
        dCountry: properties._dCountry?._value,
        dStatus: properties._dStatus?._value,
        dDate: properties._dDate?._value,
        dCountryLatitude: properties._dCountryLatitude?._value,
        dCountryLongitude: properties._dCountryLongitude?._value,
        dLatitude: properties._dLatitude?._value,
        dLongitude: properties._dLongitude?._value,
        objectId: properties._objectId?._value,
      };
      setSelectedEntity(disasterData);
      setModalVisible(true);
    }
  }, ScreenSpaceEventType.LEFT_CLICK);

  return () => {
    handler.destroy();
  };
}, [viewerRef.current]);

const showModal = (pickedEntity:any) => {
  setSelectedEntity(pickedEntity);
  console.log(pickedEntity)
  setModalVisible(true);
}

const ModalComponent = () =>{
  if (!modalVisible || !selectedEntity) {
    return null;
  }
  return (
    <div style={{ position: 'absolute', top: '10%', right: '10%', backgroundColor: 'white', padding: '20px', zIndex: 100, color:"black" }}>
      <h3>Disaster Details</h3>
      <p>Country: {selectedEntity.dCountry}</p>
      <p>Type: {selectedEntity.dType}</p>
      <p>Date: {selectedEntity.dDate}</p>
      <p>드가자: {selectedEntity.objectId}</p>
      <div className='w-full items-center flex'>
        <button className="mx-auto inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg" onClick={() => {setModalVisible(false)}}>
          Close
        </button>
      </div>
    </div>
  );
};

useEffect(() => {
  const viewer = viewerRef.current;
  if(!viewer || !viewer.scene || !viewer.camera) {
    return;
  };

  const moveEndListener = viewer.camera.moveEnd.addEventListener(() => {
      if (!isUserInput) {
        setIsUserInput(true);
        return;
      }
      const cartographicPosition = viewer.camera.positionCartographic;
      const longitude = Math.toDegrees(cartographicPosition.longitude).toFixed(6);
      const latitude = Math.toDegrees(cartographicPosition.latitude).toFixed(6);
      const zoomLv = viewer.camera.getMagnitude();
      setZoomLevel(zoomLv);
      router.push(`/earth?lon=${longitude}&lat=${latitude}`, undefined);
  });

  return () => {
    moveEndListener();
  };
}, [router]);

useEffect(() => {
  const viewer = viewerRef.current;
  const lon = search.get('lon');
  const lat = search.get('lat');
  if(!viewer || !viewer.scene || !viewer.camera) {
    return;
  };
  if (lon && lat && viewer && viewer.scene && viewer.camera) {
    setIsUserInput(false);
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(Number(lon), Number(lat), zoomLevel),
      complete: () => {
        setIsUserInput(true);
      }
    });
  }
},[router]);


  return (
    <div id="cesiumContainer" ref={cesiumContainer}>
      <ModalComponent />
    </div>
  );
};

export default EarthCesium;