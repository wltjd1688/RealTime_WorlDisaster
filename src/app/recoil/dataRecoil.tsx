//../recoil/dateRecoil.tsx
import { atom } from 'recoil';

export interface DataType{
  dID: string;
  dSource: string;
  dStatus: string;
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


// Recoil을 사용하여 상태를 관리하는 원자(atom) 정의
export const dataState = atom<DataType[]>({
  key: 'dataState',
  default: [] as DataType[],
});

