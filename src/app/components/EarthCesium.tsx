"use client"
import React, { useState, useEffect, useRef } from 'react';
import {Viewer, Math, Cartesian3, Color, PinBuilder, EntityCluster ,IonWorldImageryStyle, createWorldImageryAsync, CustomDataSource, VerticalOrigin, NearFarScalar, ScreenSpaceEventHandler, defined, ScreenSpaceEventType, Ellipsoid,BaseLayerPicker} from 'cesium';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import axios from 'axios';
import DetailLeftSidebar from './DetailLeftSidebar';

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
  objectId:number;
}

const EarthCesium = () => {
  const cesiumContainer = useRef(null);
  const router = useRouter();
  const search = useSearchParams();
  const viewerRef = useRef<Viewer|null>(null);
  const [isUserInput, setIsUserInput] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(18090749.93102962);
  const [showSidebar, setShowSidebar] = useState<Boolean>(false);

  // 디테일 사이드바 토글
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  }

  // 재난 타입에 따른 색상 지정
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
    viewer.scene.screenSpaceCameraController.enableTilt = false; // 휠클릭 회전 활성화 여부
    viewer.scene.screenSpaceCameraController.enableLook = false; // 우클릭 회전 활성화 여부
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

  // 데이터 받아오기
  const loadData = async (viewer:Viewer) => {
    try{
      const res = await axios('https://worldisaster.com/api/oldDisasters');
      // 필터링된 데이터를 받아올 수 있게 컴포넌트로 바꿀꺼임
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
          // properties에 데이터 넣기
          properties: item,
        });
        }
      });
      console.log(`데이터 로드 성공`);
    } catch(err) {
      console.log('데이터 로드 실패', err);
    }
  }

  viewer.dataSources.add(customDataSource);
  loadData(viewer);

},[]);

// 클릭 이벤트 관리
useEffect(() => {
  const viewer = viewerRef.current;
  if (!viewer || !viewer.scene || !viewer.camera) {
    return;
  }

  let originalPinSize = 0;

  const tooltip = document.createElement('div') as HTMLDivElement;
  tooltip.style.display = 'none';
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = 'white';
  tooltip.style.border = '1px solid white';
  tooltip.style.borderRadius = '10px';
  tooltip.style.padding = '5px';
  tooltip.style.color = 'black';
  document.body.appendChild(tooltip);

  // 핸들러 모음
  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

  // 호버 이벤트
  handler.setInputAction((movement:any) => {
    const pickedObject = viewerRef.current?.scene.pick(movement.endPosition);
    if (defined(pickedObject) && pickedObject.id && pickedObject.id.properties && !showSidebar) {
      const properties = pickedObject.id.properties;
      const disasterData:disasterInfoHover = {
        dId: properties._dID?._value,
        dType: properties._dType?._value,
        dCountry: properties._dCountry?._value,
        dStatus: properties._dStatus?._value,
        dDate: properties._dDate?._value,
      };
      // pickedObject.id._point._pixelSize._value
      tooltip.innerHTML = `
        <div>type: ${disasterData.dType}</div>
        <div>Country: ${disasterData.dCountry}</div>
        <div>Data: ${disasterData.dDate}</div>
        <div>Status: ${disasterData.dStatus}</div>`;
      tooltip.style.display = 'block';
      tooltip.style.bottom = `${window.innerHeight - movement.endPosition.y - 50}px`;
      tooltip.style.left = `${movement.endPosition.x}px`;
    } else {
      tooltip.style.display = 'none';
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);

  // 원클릭 이벤트
  handler.setInputAction((click:any) => {
    const pickedObject = viewer.scene.pick(click.position);
    if (defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
      const properties = pickedObject.id.properties;
      const disasterData:disasterInfo = {
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
      const camaraHeight = Ellipsoid.WGS84.cartesianToCartographic(viewer.camera.position).height;
      router.push(`/earth?lon=${disasterData.dLongitude}&lat=${disasterData.dLatitude}&height=${camaraHeight}&did=${disasterData.dId}`, undefined);

    }
  }, ScreenSpaceEventType.LEFT_CLICK);

  // 더블클릭 이벤트
  handler.setInputAction(()=>{
    
  },ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

  return () => {
    handler.destroy();
  };

}, [viewerRef.current]);

useEffect(()=>{
  console.log(isUserInput)
},[])

// 카메라 이동마다 이벤트 관리
useEffect(() => {
  const viewer = viewerRef.current;
  if(!viewer || !viewer.scene || !viewer.camera) {
    return;
  };
  
  const moveEndListener = viewer.camera.moveEnd.addEventListener(() => {
    const cameraPosition = viewer.camera.positionCartographic;
    const longitude = Math.toDegrees(cameraPosition.longitude).toFixed(4);
    const latitude = Math.toDegrees(cameraPosition.latitude).toFixed(4);
    const cameraHeight = Ellipsoid.WGS84.cartesianToCartographic(viewer.camera.position).height;
    router.push(`/earth?lon=${longitude}&lat=${latitude}&height=${cameraHeight}`, undefined);
  });

}, [viewerRef.current?.camera,search.get('did')]);

// url로 들어오는 경우 이벤트 관리
useEffect(() => {
  const viewer = viewerRef.current;
  const lon = search.get('lon');
  const lat = search.get('lat');
  const zoomHeight = search.get('height');
  const detail = search.get('did');
  if(!viewer || !viewer.scene || !viewer.camera || !isUserInput) {
    return;
  };
  if (lon && lat && viewer && viewer.scene && viewer.camera) {
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon?Number(lon):0, lat?Number(lat):0, zoomHeight?Number(zoomHeight):10e5),
      duration: 1,
      complete: () => {
        if (detail){
          setShowSidebar(true);
        }
      }
    });
  }

},[search.get('lon'), search.get('lat'), search.get('height'), search.get('did')]);


  return (
    <>
      <div id="cesiumContainer" ref={cesiumContainer}>
        {/* <ModalComponent /> */}
      </div>
      {showSidebar && <DetailLeftSidebar onClose={toggleSidebar} />}
    </>
  );
};

export default EarthCesium;