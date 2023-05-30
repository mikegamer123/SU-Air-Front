import React from 'react'
import dynamic from 'next/dynamic'

function DynamicMap() {
    const Map = React.useMemo(() => dynamic(
        () => import('src/components/Map/Map'),
        {
            ssr: false // This line is important. It's what prevents server-side render
        }
    ), [/* list variables which should trigger a re-render here */])
    return <Map />
}

export default DynamicMap