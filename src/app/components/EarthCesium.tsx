"use client"
import React, { useState, useEffect, useRef } from 'react';
import {
  Viewer,
  Math, 
  Cartesian3, 
  Color, 
  PinBuilder, 
  EntityCluster,
  IonWorldImageryStyle, 
  createWorldImageryAsync, 
  CustomDataSource, 
  VerticalOrigin, 
  NearFarScalar, 
  ScreenSpaceEventHandler, 
  defined, 
  ScreenSpaceEventType, 
  Ellipsoid, 
  Entity, 
  JulianDate,
  Transforms,
  HeadingPitchRoll,
  ConstantProperty,
  HeightReference,
  BingMapsImageryProvider,
  ImageryLayerCollection,
  ImageryLayer,
  DirectionalLight} from 'cesium';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import DidLeftSidebar from './DidLeftSidebar';
import { constSelector, useRecoilState, useRecoilValue } from 'recoil';
import { dataState, DataType, filterState, FilterType} from '../recoil/dataRecoil';
import axios from 'axios';
import FilterBar from './Filter';
import { set } from 'video.js/dist/types/tech/middleware';

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
  const [data, setData] = useRecoilState(dataState); // dataState를 data와 setData로 분리하여 사용
  const dataFilter = useRecoilValue(filterState);
  const [dIdValue, setDIdValue] = useState<string>('');
  const [custom, setCustom] = useState<CustomDataSource|null>(null);
  const [removeAfter, setRemoveAfter] = useState<boolean>(false);

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
      case 'Fire' && 'Forest Fire':
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
      // 이미 Viewer가 초기화된 경우 새로 생성하지 않음
    if (typeof window !== 'undefined' && cesiumContainer.current) {
      let viewer = new Viewer(cesiumContainer.current,{
        animation: false, // 애니메이션 위젯 비활성화
        baseLayerPicker: false,// 베이스 레이어 선택기 비활성화
        fullscreenButton: false,// 전체 화면 버튼 비활성화
        vrButton: false,// VR 버튼 비활성화
        geocoder: false,// 지오코더 비활성화
        homeButton: true,// 홈 버튼 비활성화
        infoBox: false,// 정보 박스 비활성화
        sceneModePicker: false,// 장면 모드 선택기 비활성화
        selectionIndicator: false,// 선택 지시기 비활성화
        timeline: false,// 타임라인 비활성화
        navigationHelpButton: false,// 네비게이션 도움말 버튼 비활성화
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
      viewer.scene.screenSpaceCameraController.enableLook = true; // 우클릭 회전 활성화 여부
      viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK); // 더블클릭 이벤트 제거
      // viewer.scene.globe.maximumScreenSpaceError = 0; // 지형의 최대 화면 공간 오차 (픽셀 단위)
      viewer.scene.globe.enableLighting = false; // 조명 활성화 여부
      viewer.scene.light = new DirectionalLight({
        direction: Cartesian3.fromDegrees(1.0,1.0,1.0),
        intensity: 11,
      });

      // viewer 인스턴스 저장
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
        if (viewer && viewer.destroy){
        viewer?.destroy();
        }
      }
    }
  },[]);

    //데이터 load로직
    const loadData = async () => {
      try{
        const [oldData, newData] = await Promise.all([
          axios.get('https://worldisaster.com/api/oldDisasters'),
          axios.get('https://worldisaster.com/api/newDisasters'),
        ]);
        setData(oldData.data.concat(newData.data));
        setCustom(new CustomDataSource('Disasters'));
        console.log(`데이터 로드 성공`);
      } catch(err) {
        console.log('데이터 로드 실패', err);
      }
    }

    const applyFilters = () => {
      const viewer = viewerRef.current;
      if (!viewer || !viewer.scene || !viewer.camera) {
        return;
      }
      if (!custom) return;
      viewer.dataSources.add(custom);
      let filteredData = data
      
      if (dataFilter.selectedCountry !== "world") {
        filteredData = filteredData.filter((item:DataType) => item.dCountry === dataFilter.selectedCountry);
      }
      if (dataFilter.selectedDisaster && dataFilter.selectedDisaster.length > 0) {
        filteredData = filteredData.filter((item:DataType) => !dataFilter.selectedDisaster.includes(item.dType));
      }
      if (dataFilter.selectedYear) {
        filteredData = filteredData.filter((item:DataType) => new Date(item.dDate).getFullYear() === dataFilter.selectedYear);
      }
      if (dataFilter.selectedLive !== null) {
        filteredData = filteredData.filter((item:DataType) => (dataFilter.selectedLive ? item.dStatus!=="past" : item.dStatus==="past"));
      }
  
      custom.entities.removeAll();
  
      filteredData.forEach((item:DataType) => {
        if (item.dLongitude && item.dLatitude) {
          let entityToAdd;
          if (item.dStatus === 'ongoing' || item.dStatus === 'real-time'){
            item.dStatus === 'ongoing' ? (
              entityToAdd = new Entity({
                position: Cartesian3.fromDegrees(Number(item.dLongitude), Number(item.dLatitude)),
                point: {
                  pixelSize: 8,
                  heightReference: 0,
                  outlineWidth: 2,
                  outlineColor: item.dAlertLevel=="Green"? Color.LIMEGREEN:item.dAlertLevel=="Orange"? Color.YELLOW:Color.TOMATO,
                  color: Color.fromCssColorString(getColorForDisasterType(item.dType)),
                  
                },
                properties: item,
              })):(
              entityToAdd = new Entity({
                position: Cartesian3.fromDegrees(Number(item.dLongitude), Number(item.dLatitude)),
                model: {
                  uri: `/pin/${getColorForDisasterType(item.dType)}.glb`,
                  minimumPixelSize: 100,
                  maximumScale: 80000,
                  heightReference: HeightReference.CLAMP_TO_GROUND,
                },
                properties: item,
            }))
          } else {
            entityToAdd = new Entity({
              position: Cartesian3.fromDegrees(Number(item.dLongitude), Number(item.dLatitude)),
              point: {
                pixelSize: 10,
                heightReference: 0,
                color: Color.fromCssColorString(getColorForDisasterType(item.dType)),
              },
              properties: item,
            });
          }
          // rotateEntity(entityToAdd, viewer, item);
          custom.entities.add(entityToAdd)
        }
      });
    }
  
  useEffect(()=>{
    loadData();
  },[]) 

  useEffect(()=>{
    if (!custom || !viewerRef.current) return;
      // custom.entities.removeAll();
      viewerRef.current.dataSources.remove(custom);
  },[dataFilter])

  useEffect(()=>{
    if (!custom || !viewerRef.current) return;
    applyFilters();
  },[dataFilter])
  
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.scene || !viewer.camera) {
      return;
    }

    const customDataSource = new CustomDataSource('Disasters');
    viewer.dataSources.add(customDataSource);

  }, [dataFilter, data]);

  // 클릭 이벤트 관리
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.scene || !viewer.camera) {
      return;
    }

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
        setDIdValue(disasterData.dId);
        setIsUserInput(true)
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    // 더블클릭 이벤트
    handler.setInputAction(()=>{
      
    },ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

    return () => {
      handler.destroy();
    };

  }, [viewerRef.current]);

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

    return()=>{
      if (!isUserInput){
        moveEndListener()
      }
    }

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
            setDIdValue(detail);
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
      {showSidebar && <DidLeftSidebar onClose={toggleSidebar} dID={dIdValue} />}
      <FilterBar/>
    </>
  );
};

export default EarthCesium;