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

const TIRE_DB = {
  'Schwalbe Kojak 16"': {ETRTOSize: [32, 349]},
  'Schwalbe Marathon 16"': {ETRTOSize: [35, 349]},
  'Schwalbe Marathon Racer 16"': {ETRTOSize: [35, 349]},
  'Schwalbe One 16"': {ETRTOSize: [35, 349]},
  'Schwalbe Green Marathon 16"': {ETRTOSize: [35, 349]},
  'Schwalbe Green Marathon 20"': {ETRTOSize: [47, 406]},
  'Surly ExtraTerrestrial 26"x46': {ETRTOSize: [46, 559]},
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
  },
};
type CassetteID = keyof typeof CASSETTE_DB;

interface Bike {
  tire: TireID;
  chainringTeeth: number;
  cassette: CassetteID;
  // Needs to be separately specified for IGH bikes
  sprockets?: number[];
}

const BIKE_DB: Record<string, Bike> = {
  'Brompton A Line': {
    tire: 'Schwalbe Kojak 16"',
    chainringTeeth: 44,
    cassette: 'Sturmey Archer BSR',
    sprockets: [13],
  },
  'Brompton C Line 3 speed': {
    // Discontinued
    tire: 'Schwalbe Marathon 16"',
    chainringTeeth: 50,
    cassette: 'Sturmey Archer BSR',
    sprockets: [13],
  },
  'Brompton C Line 6 speed': {
    tire: 'Schwalbe Marathon Racer 16"',
    chainringTeeth: 50,
    cassette: 'Sturmey Archer BWR',
    sprockets: [13, 16],
  },
  'Cranston R9 Max 9 speed': {
    tire: 'Schwalbe Green Marathon 16"',
    chainringTeeth: 53,
    cassette: 'Shimano Alivio CS-HG400 9 Speed 11-32T',
  },
  'Cranston R20 Max 9 speed': {
    tire: 'Schwalbe Green Marathon 20"',
    chainringTeeth: 53,
    cassette: 'Shimano Alivio CS-HG400 9 Speed 11-32T',
  },
  'Surly Disc Trucker': {
    tire: 'Surly ExtraTerrestrial 26"x46',
    chainringTeeth: 48, // TODO: need to fix
    cassette: 'Shimano Alivio CS-HG400 9 Speed 11-34T',
  },
};

type BikeID = keyof typeof BIKE_DB;

const BikeCalculator = ({
  bike,
  onCustomize,
}: {
  bike?: Bike;
  onCustomize: () => void;
}) => {
  const [ETRTOWidth, setETRTOWidth] = useState<number>(
    bike ? TIRE_DB[bike.tire].ETRTOSize[0] : 0,
  );
  const [ETRTODiameter, setETRTODiameter] = useState<number>(
    bike ? TIRE_DB[bike.tire].ETRTOSize[1] : 0,
  );
  const [chainringTeeth, setChainringTeeth] = useState<number>(
    bike ? bike.chainringTeeth : 0,
  );
  const [sprocketCount, setSprocketCount] = useState<number>(
    bike
      ? !CASSETTE_DB[bike.cassette].isIGH
        ? CASSETTE_DB[bike.cassette].sprockets.length
        : 0
      : 0,
  );
  const [sprocketTeeth, setSprocketTeeth] = useState<number[]>(
    bike
      ? !CASSETTE_DB[bike.cassette].isIGH
        ? CASSETTE_DB[bike.cassette].sprockets
        : []
      : [],
  );
  const [cassetteID, setCassetteID] = useState<CassetteID | 'custom'>(
    bike ? bike.cassette : 'custom',
  );
  const [tireID, setTireID] = useState<TireID | 'custom'>(
    bike ? bike.tire : 'custom',
  );

  useEffect(() => {
    setSprocketTeeth((sprocketTeeth) => [
      ...sprocketTeeth.slice(0, sprocketCount),
      ...Array(Math.max(sprocketCount - sprocketTeeth.length, 0)),
    ]);
  }, [sprocketCount]);

  useEffect(() => {
    if (cassetteID !== 'custom') {
      const cassette = CASSETTE_DB[cassetteID];
      if (cassette.isIGH) {
      } else {
        setSprocketCount(cassette.sprockets.length);
        setSprocketTeeth(cassette.sprockets);
      }
    }
  }, [cassetteID]);

  useEffect(() => {
    if (tireID !== 'custom') {
      const tire = TIRE_DB[tireID];
      setETRTOWidth(tire.ETRTOSize[0]);
      setETRTODiameter(tire.ETRTOSize[1]);
    }
  }, [tireID]);

  useEffect(() => {
    // TODO: This runs even when props changed ...
    // onCustomize();
  }, [
    ETRTOWidth,
    ETRTODiameter,
    chainringTeeth,
    sprocketCount,
    sprocketTeeth,
    cassetteID,
    tireID,
  ]);

  // When prop updates
  useEffect(() => {
    if (bike) {
      setTireID(bike.tire);
      setCassetteID(bike.cassette);
      setChainringTeeth(bike.chainringTeeth);
      if (bike.sprockets) {
        setSprocketCount(bike.sprockets.length);
        setSprocketTeeth(bike.sprockets);
      }
    }
  }, [bike]);

  return (
    <div className="App">
      <table className="m-4">
        <tbody>
          <tr>
            <td className="px-2">
              <label>Tire</label>
            </td>
            <td className="px-2">
              <select
                onChange={(e) => setTireID(e.target.value as TireID)}
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
            <label>Chainring Teeth</label>
          </div>
          <div className="px-2">
            <input
              type="number"
              onChange={(e) => setChainringTeeth(e.target.valueAsNumber)}
              value={chainringTeeth}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-row items-center">
          <div className="px-2 w-32">
            <label>Cassette / Hub</label>
          </div>
          <div className="px-2">
            <select
              onChange={(e) => setCassetteID(e.target.value as CassetteID)}
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
                setSprocketCount(e.target.valueAsNumber);
                if (!CASSETTE_DB[cassetteID].isIGH) {
                  setCassetteID('custom');
                }
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
                    if (!CASSETTE_DB[cassetteID].isIGH) {
                      setCassetteID('custom');
                    }
                  }}
                  value={sprocketTeeth[i]}
                  className="w-9 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            ))}
        </div>
        {cassetteID !== 'custom' &&
          CASSETTE_DB[cassetteID].isIGH &&
          CASSETTE_DB[cassetteID].ratios.map((ratio, i) => (
            <div className="flex flex-row" key={i}>
              <div className="w-32"></div>
              {Array(sprocketCount)
                .fill(0)
                .map((v, i) => (
                  <div key={i} className="w-9 text-right">
                    {Math.round(
                      gearInches(
                        ETRTOtoDiameter(ETRTOWidth, ETRTODiameter) / 25.4,
                        chainringTeeth,
                        sprocketTeeth[i] * ratio,
                      ),
                    )}
                  </div>
                ))}
            </div>
          ))}
        {!CASSETTE_DB[cassetteID]?.isIGH && (
          <div className="flex flex-row">
            <div className="w-32"></div>
            {Array(sprocketCount)
              .fill(0)
              .map((v, i) => (
                <div key={i} className="w-9 text-right">
                  {Math.round(
                    gearInches(
                      ETRTOtoDiameter(ETRTOWidth, ETRTODiameter) / 25.4,
                      chainringTeeth,
                      sprocketTeeth[i],
                    ),
                  )}
                </div>
              ))}
          </div>
        )}
        <table></table>
      </div>
    </div>
  );
};

export default function Home() {
  const [bikeID, setBikeID] = useState<BikeID | 'custom'>('custom');

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
      </div>
      <BikeCalculator
        bike={BIKE_DB[bikeID]}
        onCustomize={() => setBikeID('custom')}
      />
    </div>
  );
}
