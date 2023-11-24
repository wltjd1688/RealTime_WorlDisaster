import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEarthCanvas = dynamic(
  () => import('../components/EarthCesium'),
  { loading: () => <p>Loading...</p> }
);

export default function Home() {
  return (
    <>
      <div className='h-[100vh] flex items-center justify-center'>
        <DynamicEarthCanvas/>
      </div>
    </>
  )
}