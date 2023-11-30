import React, { useEffect } from 'react';
import axios from 'axios';
import { atom, useRecoilState, useRecoilValueLoadable } from 'recoil';

export interface DataType{
  objectId: number;
  dID: string;
  dStatus: string;
  dCountry: string;
  dCountryCode: string;
  dType: string;
  dDate: string;
  dLatitude: string;
  dLongitude: string;
  dTitle: string;
  dDescription: string;
  dUrl: string;
}

// Recoil을 사용하여 상태를 관리하는 원자(atom) 정의
export const dataState = atom<DataType[]>({
  key: 'dataState',
  default: [] as DataType[],
});
