'use client';

import {useEffect, useState} from 'react';

const ETRTOtoDiameter = (ETRTOWidth: number, ETRTODiameter: number): number =>
  ETRTOWidth * 2 + ETRTODiameter;

const ETRTOtoCircumference = (
  ETRTOWidth: number,
  ETRTODiameter: number,
): number => Math.PI * ETRTOtoDiameter(ETRTOWidth, ETRTODiameter);

const gearInches = (
  tireDiameter: number,
  chainringTeeth: number,
  sprocketTeeth: number,
): number => (tireDiameter * chainringTeeth) / sprocketTeeth;

type ColorValueHex = `#${string}`;

function interpolateColor(
  color1: ColorValueHex,
  color2: ColorValueHex,
  factor: number,
) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function createMapRangeToColor(
  colorMin: ColorValueHex,
  colorMid: ColorValueHex,
  colorMax: ColorValueHex,
) {
  return function (value: number, min: number, max: number) {
    const midpoint = (min + max) / 2;

    if (value <= midpoint) {
      // Scale value from min to midpoint (0 to 1)
      const factor = (value - min) / (midpoint - min);
      return interpolateColor(colorMin, colorMid, factor);
    } else {
      // Scale value from midpoint to max (0 to 1)
      const factor = (value - midpoint) / (max - midpoint);
      return interpolateColor(colorMid, colorMax, factor);
    }
  };
}

const mapGearInchesToColor = (gearInches: number) =>
  createMapRangeToColor('#56bb8a', '#fed666', '#e67c73')(gearInches, 20, 120);

const TIRE_DB = {
  'Schwalbe Billy Bonkers 16"': {ETRTOSize: [50, 305]},
  'Schwalbe Kojak 16"': {ETRTOSize: [32, 349]},
  'Schwalbe Marathon 16"': {ETRTOSize: [35, 349]},
  'Schwalbe Marathon Racer 16"': {ETRTOSize: [35, 349]},
  'Schwalbe One 16"': {ETRTOSize: [35, 349]},
  'Schwalbe Green Marathon 16"': {ETRTOSize: [35, 349]},
  'Schwalbe Billy Bonkers 18"': {ETRTOSize: [50, 355]},
  'Schwalbe G-One Allround 20"': {ETRTOSize: [54, 406]},
  'Schwalbe Green Marathon 20"': {ETRTOSize: [47, 406]},
  'Schwalbe Billy Bonkers 20"x1.5"': {ETRTOSize: [40, 406]},
  'Schwalbe Billy Bonkers 20"x2.0"': {ETRTOSize: [50, 406]},
  'Schwalbe Billy Bonkers 24"': {ETRTOSize: [50, 507]},
  'Schwalbe Crazy Bob 24"': {ETRTOSize: [60, 507]},
  'Schwalbe Big Apple 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Big Ben 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Billy Bonkers 26"x2.0"': {ETRTOSize: [50, 559]},
  'Schwalbe Billy Bonkers 26"x2.10"': {ETRTOSize: [54, 559]},
  'Schwalbe Billy Bonkers 26"x2.25"': {ETRTOSize: [57, 559]},
  'Schwalbe Crazy Bob 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Dirty Dan 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Fat Frank 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Hans Dampf 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Ice Spiker/Ice Spiker Pro 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Magic Mary 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Nobby Nic 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Rock Razor 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Rocket Ron 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Space 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Super Moto 26"': {ETRTOSize: [60, 559]},
  'Schwalbe Magic Mary 26" (64-559)': {ETRTOSize: [64, 559]},
  'Surly ExtraTerrestrial 26"x46': {ETRTOSize: [46, 559]},
  'Schwalbe Dirty Dan 27.5"': {ETRTOSize: [60, 584]},
  'Schwalbe Hans Dampf 27.5"': {ETRTOSize: [60, 584]},
  'Schwalbe Magic Mary 27.5"': {ETRTOSize: [60, 584]},
  'Schwalbe Nobby Nic 27.5"': {ETRTOSize: [60, 584]},
  'Schwalbe Rock Razor 27.5"': {ETRTOSize: [60, 584]},
  'Schwalbe Big Apple 28"x2.0"': {ETRTOSize: [50, 622]},
  'Schwalbe Big Apple Plus 28"x2.15"': {ETRTOSize: [50, 622]},
  'Schwalbe Big Apple 28"x2.15"': {ETRTOSize: [55, 622]},
  'Schwalbe Big Ben 28"x2.15"': {ETRTOSize: [55, 622]},
  'Schwalbe Marathon Almotion 28"': {ETRTOSize: [55, 622]},
  'Schwalbe Big Apple 29"': {ETRTOSize: [60, 622]},
  'Schwalbe Hans Dampf 29"': {ETRTOSize: [60, 622]},
  'Schwalbe Magic Mary 29"': {ETRTOSize: [60, 622]},
  'Schwalbe Nobby Nic 29"': {ETRTOSize: [60, 622]},
  'Schwalbe Racing Ralph 29"': {ETRTOSize: [60, 622]},
  'Schwalbe Super Moto 29"': {ETRTOSize: [60, 622]},
  'Specialized Ground Control Grid T7 29"x2.2"': {ETRTOSize: [54, 622]},
};
type TireID = keyof typeof TIRE_DB;

interface ExternalCassette {
  sprockets: number[];
  isIGH?: false;
}
interface InternallyGearedHub {
  isIGH: true;
  ratios: number[];
}
type Cassette = ExternalCassette | InternallyGearedHub;

const CASSETTE_DB: Record<string, Cassette> = {
  'Shimano Alfine 8 Speed Hub': {
    ratios: [0.527, 0.644, 0.748, 0.851, 1, 1.223, 1.419, 1.615],
    isIGH: true,
  },
  'Shimano Alfine 11 Speed Hub': {
    ratios: [
      0.527, 0.681, 0.77, 0.878, 0.995, 1.134, 1.292, 1.462, 1.667, 1.888,
      2.153,
    ],
    isIGH: true,
  },
  'Shimano Alivio CS-HG400 9 Speed 11-28T': {
    sprockets: [11, 12, 13, 14, 16, 18, 21, 24, 28],
  },
  'Shimano Alivio CS-HG400 9 Speed 11-32T': {
    sprockets: [11, 12, 14, 16, 18, 21, 24, 28, 32],
  },
  'Shimano Alivio CS-HG400 9 Speed 11-34T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 34],
  },
  'Shimano Alivio CS-HG400 9 Speed 11-36T': {
    sprockets: [11, 13, 15, 17, 20, 23, 26, 30, 36],
  },
  'Shimano Alivio CS-HG400 9 Speed 12-36T': {
    sprockets: [12, 14, 16, 18, 21, 24, 28, 32, 36],
  },
  'Sturmey Archer BSR': {
    // THink this is the same hub as S-RF3
    ratios: [0.75, 1, 1.3333333],
    isIGH: true,
  },
  'Sturmey Archer BWR': {
    ratios: [0.64, 1, 1.56],
    isIGH: true,
  },
  'Sturmey Archer S-RF3': {
    ratios: [0.75, 1, 1.3333333],
    isIGH: true,
    // TODO: would be nice for IGH to specify maximum sprockets
  },
};
type CassetteID = keyof typeof CASSETTE_DB;
// Type guard
const isInternallyGearedHub = (
  cassette: Cassette | InternallyGearedHub,
): cassette is InternallyGearedHub => {
  return 'isIGH' in cassette;
};

interface Bike {
  tire: TireID;
  chainringTeeth: number[];
  cassette: CassetteID;
  // Needs to be separately specified for IGH bikes
  sprockets?: number[];
}

const BIKE_DB: Record<string, Bike> = {
  'Brompton A Line': {
    tire: 'Schwalbe Kojak 16"',
    chainringTeeth: [44],
    cassette: 'Sturmey Archer BSR',
    sprockets: [13],
  },
  'Brompton C Line 3 speed': {
    // Discontinued
    tire: 'Schwalbe Marathon 16"',
    chainringTeeth: [50],
    cassette: 'Sturmey Archer BSR',
    sprockets: [13],
  },
  'Brompton C Line 6 speed': {
    tire: 'Schwalbe Marathon Racer 16"',
    chainringTeeth: [50],
    cassette: 'Sturmey Archer BWR',
    sprockets: [13, 16],
  },
  'Brompton G Line': {
    tire: 'Schwalbe G-One Allround 20"',
    chainringTeeth: [54],
    cassette: 'Shimano Alfine 8 Speed Hub',
    sprockets: [20],
  },
  'Cranston R9 Max 9 speed': {
    tire: 'Schwalbe Green Marathon 16"',
    chainringTeeth: [53],
    cassette: 'Shimano Alivio CS-HG400 9 Speed 11-32T',
  },
  'Cranston R20 Max 9 speed': {
    tire: 'Schwalbe Green Marathon 20"',
    chainringTeeth: [53],
    cassette: 'Shimano Alivio CS-HG400 9 Speed 11-32T',
  },
  'Surly Disc Trucker': {
    tire: 'Surly ExtraTerrestrial 26"x46',
    chainringTeeth: [48, 36, 26],
    cassette: 'Shimano Alivio CS-HG400 9 Speed 11-34T',
  },
};

type BikeID = keyof typeof BIKE_DB;

const configEqualToBike = (
  {
    ETRTOWidth,
    ETRTODiameter,
    chainringTeeth,
    sprocketTeeth,
    tireID,
    cassetteID,
  }: {
    ETRTOWidth: number;
    ETRTODiameter: number;
    chainringTeeth: number[];
    sprocketTeeth: number[];
    tireID: TireID;
    cassetteID: CassetteID;
  },
  bike: Bike,
): boolean => {
  const bikeTire = TIRE_DB[tireID];
  const tiresEqual =
    tireID === bike.tire &&
    ETRTOWidth === bikeTire.ETRTOSize[0] &&
    ETRTODiameter === bikeTire.ETRTOSize[1];
  const chainringsEqual =
    chainringTeeth.length === bike.chainringTeeth.length &&
    chainringTeeth.every(
      (chainring, i) => chainring === bike.chainringTeeth[i],
    );
  const bikeCassette = CASSETTE_DB[bike.cassette];
  const cassettesEqual =
    bike.cassette === cassetteID &&
    (bikeCassette.isIGH
      ? !!bike.sprockets &&
        sprocketTeeth.length === bike.sprockets.length &&
        sprocketTeeth.every(
          (sprocket, i) => bike.sprockets && sprocket === bike.sprockets[i],
        )
      : true);
  return tiresEqual && chainringsEqual && cassettesEqual;
};

const GearInchesTable = ({
  sprocketCount,
  sprocketTeeth,
  chainringTeeth,
  ETRTODiameter,
  ETRTOWidth,
  ratio,
}: {
  sprocketCount: number;
  sprocketTeeth: number[];
  chainringTeeth: number;
  ETRTODiameter: number;
  ETRTOWidth: number;
  ratio?: number;
}) => [
  ...Array(sprocketCount)
    .fill(0)
    .map((v, i) => {
      const gI =
        gearInches(
          ETRTOtoDiameter(ETRTOWidth, ETRTODiameter) / 25.4,
          chainringTeeth,
          sprocketTeeth[i] / (ratio || 1),
        ) || 0;
      return (
        <div
          key={i}
          className={`w-9 text-right ${i === 0 ? 'ml-2' : ''}`}
          style={{backgroundColor: mapGearInchesToColor(gI)}}
        >
          {Math.round(gI)}
        </div>
      );
    }),
  ...(ratio != undefined
    ? [
        <div key="ratio" className="pl-2">
          {ratio.toFixed(3)}
        </div>,
      ]
    : []),
];

const BikeCalculator = ({
  bike,
  onCustomized,
}: {
  bike?: Bike;
  onCustomized: (customized: boolean) => void;
}) => {
  const [tireID, setTireID] = useState<TireID | 'custom'>(
    bike ? bike.tire : 'custom',
  );
  // ETRTO state is quasi-derived/computed from props bike.tire TireID, but can be overridden by user
  // so remember to set these when setting tireID. see https://react.dev/learn/you-might-not-need-an-effect
  const [ETRTOWidth, setETRTOWidth] = useState<number>(
    bike ? TIRE_DB[bike.tire].ETRTOSize[0] : 0,
  );
  const [ETRTODiameter, setETRTODiameter] = useState<number>(
    bike ? TIRE_DB[bike.tire].ETRTOSize[1] : 0,
  );
  const [chainringCount, setChainringCount] = useState<number>(
    bike ? bike.chainringTeeth.length : 1,
  );
  const [chainringTeeth, setChainringTeeth] = useState<number[]>(
    bike ? bike.chainringTeeth : [0],
  );
  const [cassetteID, setCassetteID] = useState<CassetteID | 'custom'>(
    bike ? bike.cassette : 'custom',
  );
  const cassette = bike ? CASSETTE_DB[bike.cassette] : undefined;
  const [sprocketCount, setSprocketCount] = useState<number>(
    cassette
      ? !isInternallyGearedHub(cassette)
        ? cassette.sprockets.length
        : bike?.sprockets?.length || 0
      : 0,
  );
  const [sprocketTeeth, setSprocketTeeth] = useState<number[]>(
    cassette
      ? !isInternallyGearedHub(cassette)
        ? cassette.sprockets
        : bike?.sprockets || []
      : [],
  );

  useEffect(() => {
    if (bike) {
      onCustomized(
        !(
          tireID !== 'custom' &&
          cassetteID !== 'custom' &&
          configEqualToBike(
            {
              ETRTOWidth,
              ETRTODiameter,
              chainringTeeth,
              sprocketTeeth,
              tireID,
              cassetteID,
            },
            bike,
          )
        ),
      );
    }
  }, [
    ETRTOWidth,
    ETRTODiameter,
    chainringTeeth,
    sprocketCount,
    sprocketTeeth,
    cassetteID,
    tireID,
    bike,
    onCustomized,
  ]);

  const CassetteGearInchesTable = chainringTeeth.map((chainringTeeth) =>
    (cassetteID !== 'custom' && CASSETTE_DB[cassetteID].isIGH
      ? CASSETTE_DB[cassetteID].ratios.toReversed()
      : [undefined]
    ).map((ratio, i) => (
      <div className="flex flex-row" key={i}>
        <div className="w-32 text-right">{chainringTeeth}T</div>
        <GearInchesTable
          {...{
            sprocketCount,
            sprocketTeeth,
            chainringTeeth,
            ETRTODiameter,
            ETRTOWidth,
            ratio,
          }}
        />
      </div>
    )),
  );

  return (
    <div className="bike-calc">
      <table className="m-4">
        <tbody>
          <tr>
            <td className="px-2">
              <label>Tire</label>
            </td>
            <td className="px-2">
              <select
                onChange={(e) => {
                  const tireID = e.target.value as TireID | 'custom';
                  setTireID(tireID);
                  if (tireID !== 'custom') {
                    const tire = TIRE_DB[tireID];
                    setETRTOWidth(tire.ETRTOSize[0]);
                    setETRTODiameter(tire.ETRTOSize[1]);
                  }
                }}
                value={tireID}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="custom">Custom</option>
                {Object.entries(TIRE_DB).map(([name]) => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className="px-2">
              <label>ETRTO Width</label>
            </td>
            <td className="px-2">
              <input
                type="number"
                onChange={(e) => {
                  setETRTOWidth(e.target.valueAsNumber);
                  setTireID('custom');
                }}
                value={ETRTOWidth}
                className="w-14 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </td>
          </tr>
          <tr>
            <td className="px-2">
              <label>ETRTO Diameter</label>
            </td>
            <td className="px-2">
              <input
                type="number"
                onChange={(e) => {
                  setETRTODiameter(e.target.valueAsNumber);
                  setTireID('custom');
                }}
                value={ETRTODiameter}
                className="w-14 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </td>
          </tr>
          <tr>
            <td className="px-2">
              <label>Tire Diameter</label>
            </td>
            <td className="px-2">
              <input
                type="number"
                disabled
                value={(
                  ETRTOtoDiameter(ETRTOWidth, ETRTODiameter) / 25.4
                ).toFixed(2)}
                className="w-14 text-right  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-not-allowed "
              />
            </td>
          </tr>
          <tr>
            <td className="px-2">
              <label>Tire Circumference</label>
            </td>
            <td className="px-2">
              <input
                type="number"
                disabled
                value={Math.round(
                  ETRTOtoCircumference(ETRTOWidth, ETRTODiameter),
                )}
                className="w-14 text-right  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-not-allowed "
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="m-4">
        <div className="flex flex-row items-center">
          <div className="px-2 w-32">
            <label>Chainrings</label>
          </div>
          <div className="px-2">
            <input
              type="number"
              onChange={(e) => {
                const chainringCount = e.target.valueAsNumber;
                setChainringCount(chainringCount);
                setChainringTeeth([
                  ...chainringTeeth.slice(0, chainringCount),
                  ...Array(Math.max(chainringCount - chainringTeeth.length, 0)),
                ]);
              }}
              value={chainringCount}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-row items-center">
          <div className="px-2 w-32">
            <label>Chainring Teeth</label>
          </div>
          {Array(chainringCount)
            .fill(0)
            .map((v, i) => (
              <div key={i} className={i === 0 ? 'pl-2' : ''}>
                <input
                  type="number"
                  onChange={(e) =>
                    setChainringTeeth(
                      chainringTeeth.with(i, e.target.valueAsNumber),
                    )
                  }
                  value={chainringTeeth[i]}
                  className="w-9 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            ))}
        </div>
        <div className="flex flex-row items-center">
          <div className="px-2 w-32">
            <label>Cassette / Hub</label>
          </div>
          <div className="px-2">
            <select
              onChange={(e) => {
                const cassetteID = e.target.value as CassetteID;
                setCassetteID(cassetteID);
                if (cassetteID !== 'custom') {
                  const cassette = CASSETTE_DB[cassetteID];
                  if (cassette.isIGH) {
                  } else {
                    setSprocketCount(cassette.sprockets.length);
                    setSprocketTeeth(cassette.sprockets);
                  }
                }
              }}
              value={cassetteID}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="custom">Custom</option>
              {Object.entries(CASSETTE_DB).map(([name]) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="px-2">
            <label>Sprockets</label>
          </div>
          <div className="px-2">
            <input
              type="number"
              onChange={(e) => {
                const sprocketCount = e.target.valueAsNumber;
                setSprocketCount(sprocketCount);
                if (
                  cassetteID !== 'custom' &&
                  !CASSETTE_DB[cassetteID]?.isIGH
                ) {
                  setCassetteID('custom');
                }
                setSprocketTeeth([
                  ...sprocketTeeth.slice(0, sprocketCount),
                  ...Array(Math.max(sprocketCount - sprocketTeeth.length, 0)),
                ]);
              }}
              value={sprocketCount}
              className="w-12 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
        {cassetteID !== 'custom' && CASSETTE_DB[cassetteID].isIGH && (
          <div className="flex flex-row items-center">
            <div className="px-2 w-32">
              <label>Ratios</label>
            </div>
            <div>
              {Array(CASSETTE_DB[cassetteID].ratios.length)
                .fill(0)
                .map((v, i) => (
                  <span key={i} className={i === 0 ? 'pl-2' : ''}>
                    <input
                      type="number"
                      disabled
                      value={(
                        CASSETTE_DB[cassetteID] as InternallyGearedHub
                      ).ratios[i].toFixed(2)}
                      className="w-12 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-not-allowed "
                    />
                  </span>
                ))}
            </div>
          </div>
        )}
        <div className="flex flex-row items-center">
          <div className="px-2 w-32">
            <label>Sprocket Teeth</label>
          </div>
          {Array(sprocketCount)
            .fill(0)
            .map((v, i) => (
              <div key={i} className={i === 0 ? 'pl-2' : ''}>
                <input
                  type="number"
                  onChange={(e) => {
                    setSprocketTeeth(
                      sprocketTeeth.with(i, e.target.valueAsNumber),
                    );
                    if (!CASSETTE_DB[cassetteID]?.isIGH) {
                      setCassetteID('custom');
                    }
                  }}
                  value={sprocketTeeth[i]}
                  className="w-9 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            ))}
        </div>
        {CassetteGearInchesTable}
      </div>
    </div>
  );
};

export default function Home() {
  const [bikeID, setBikeID] = useState<BikeID | 'custom'>('custom');
  const [customized, setCustomized] = useState<boolean>(false);

  return (
    <div>
      <div className="px-2">
        <label>Bike</label>
      </div>
      <div className="px-2">
        <select
          onChange={(e) => setBikeID(e.target.value as BikeID)}
          value={bikeID}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="custom">Custom</option>
          {Object.entries(BIKE_DB).map(([name]) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
        <div
          className={`bg-blue-500 rounded-full w-4 h-4 ${
            customized ? '' : 'hidden'
          }`}
        ></div>
      </div>
      {/* key prop supplied to force reset state when bike prop changes. see
      https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
      <BikeCalculator
        bike={BIKE_DB[bikeID]}
        key={bikeID}
        onCustomized={(customized) => {
          setCustomized(customized);
          if (customized) {
            // setBikeID('custom');
          }
        }}
      />
    </div>
  );
}
