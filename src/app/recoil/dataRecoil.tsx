//../recoil/dateRecoil.tsx
import { atom } from 'recoil';

export interface DataType{
  dID: string;
  dSource: string;
  dStatus: string;
  dAlertLevel: string|null;
  dCountry: string;
  dDistrict: string|null;
  dType: string;
  dDate: string;
  dLatitude: number;
  dLongitude: number;
  dTitle: string;
  dDescription: string;
  dUrl: string;
}

export interface FilterType{
    selectedCountry: string|null,
    selectedDisaster: string[],
    selectedYear: number,
    selectedLive: boolean;
}


// Recoil을 사용하여 상태를 관리하는 원자(atom) 정의
export const dataState = atom<DataType[]>({
  key: 'dataState',
  default: [] as DataType[],
});

export const filterState = atom<FilterType>({
  key: 'filterState',
  default: {
    selectedCountry: null,
    selectedDisaster: [],
    selectedYear: 2023,
    selectedLive: true,
  }
})

