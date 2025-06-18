import { useMemo, useState } from "react";
import R3fGlobe from "r3f-globe";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import type { Route } from "../../schemas/flights";

import PlaneModal from "./PlaneModal";
import WaitModal from "./WaitModal";
import WelcomeCard from "./WelcomeCard";

// TODO get rid of all anys bad practice

type GlobeVizProps = {
  focusState: State<number | undefined>;
  getRoute: (callsign: string) => void;
  route: { arrival: Route; departure: Route } | undefined;
  fData: {
    lat: number;
    lng: number;
    color: string;
    size: number;
    callsign: string | null;
    index: number;
  }[];
  warningState: State<string | undefined>;
};

const GlobeViz = ({
  focusState,
  route,
  fData,
  getRoute,
  warningState,
}: GlobeVizProps) => {
  const [flightFocus, setFlightFocus] = focusState;
  const [showRoute, setShowRoute] = useState(false);
  const [, setWarning] = warningState;

  const points = flightFocus === undefined ? fData : [fData[flightFocus]];

  const gData = useMemo(() => {
    if (!route || !showRoute) return [];

    return [
      {
        startLat: route.departure.info.geoCode.latitude,
        startLng: route.departure.info.geoCode.longitude,
        endLat: route.arrival.info.geoCode.latitude,
        endLng: route.arrival.info.geoCode.longitude,
        color: "red",
      },
    ];
  }, [route]);

  const arcLayer = {
    arcsData: gData,
    arcColor: "color",
    arcDashLength: 0.4,
    arcDashGap: 4,
    arcDashAnimateTime: 2000,
    arcAltitude: 0.2,
    arcStroke: 0.6,
  };

  return (
    <R3fGlobe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      pointsData={points}
      pointAltitude="size"
      pointColor="color"
      pointRadius={0.1}
      {...arcLayer}
      onClick={(layer, data) => {
        if (layer == "point") {
          if (flightFocus === undefined) {
            setFlightFocus((data as any).index);
            const callsign = (data as any).callsign as string | undefined;
            if (callsign) {
              getRoute(callsign);
              setShowRoute(true);
            }
          } else {
            setWarning(undefined);
            setFlightFocus(undefined);
            setShowRoute(false);
          }
        }
      }}
    />
  );
};

type State<T> = [T, (newVal: T) => void];

const Globe = ({
  fData,
  lastUpdated,
  getRoute,
  route,
  warningState,
}: {
  getRoute: (callsign: string) => void;
  route: { arrival: Route; departure: Route } | undefined;
  lastUpdated: Date | undefined;
  warningState: State<string | undefined>;
  fData: {
    lat: number;
    lng: number;
    color: string;
    size: number;
    callsign: string | null;
    index: number;
  }[];
}) => {
  const [flightFocus, setFlightFocus] = useState<number | undefined>();

  return (
    <>
      <div style={{ height: window.innerHeight }}>
        <Canvas
          flat
          camera={useMemo(() => ({ fov: 50, position: [0, 0, 350] }), [])}
        >
          <OrbitControls
            minDistance={101}
            maxDistance={1e4}
            dampingFactor={0.1}
            zoomSpeed={0.3}
            rotateSpeed={0.3}
          />
          <color attach="background" args={[0, 0, 0]} />
          <ambientLight color={0xcccccc} intensity={Math.PI} />
          <directionalLight intensity={0.6 * Math.PI} />
          <GlobeViz
            focusState={[flightFocus, setFlightFocus]}
            route={route}
            getRoute={getRoute}
            fData={fData}
            warningState={warningState}
          />
        </Canvas>
      </div>
      {flightFocus && !route ? (
        <WaitModal flight={fData[flightFocus]} />
      ) : undefined}

      {flightFocus && route ? (
        <PlaneModal flight={fData[flightFocus]} route={route} />
      ) : undefined}
      <WelcomeCard lastUpdated={lastUpdated} />
    </>
  );
};

export default Globe;
