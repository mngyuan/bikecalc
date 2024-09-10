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
  'Schwalbe Marathon Racer 16"': {ETRTOSize: [35, 349]},
  'Schwalbe One 16"': {ETRTOSize: [35, 349]},
  'Schwalbe Green Marathon 16"': {ETRTOSize: [35, 349]},
  'Schwalbe Green Marathon 20"': {ETRTOSize: [47, 406]},
  'Surly ExtraTerrestrial 26"x46': {ETRTOSize: [46, 559]},
  'Specialized Ground Control Grid T7 29"x2.2"': {ETRTOSize: [54, 622]},
};
type TireID = keyof typeof TIRE_DB | 'custom';

const CASSETTE_DB = {
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
};
type CassetteID = keyof typeof CASSETTE_DB | 'custom';

export default function Home() {
  const [ETRTOWidth, setETRTOWidth] = useState<number>(0);
  const [ETRTODiameter, setETRTODiameter] = useState<number>(0);
  const [chainringTeeth, setChainringTeeth] = useState<number>(0);
  const [sprocketCount, setSprocketCount] = useState<number>(0);
  const [sprocketTeeth, setSprocketTeeth] = useState<number[]>([]);
  const [cassetteID, setCassetteID] = useState<CassetteID>('custom');
  const [tireID, setTireID] = useState<TireID>('custom');

  useEffect(() => {
    setSprocketTeeth((sprocketTeeth) => [
      ...sprocketTeeth.slice(0, sprocketCount),
      ...Array(Math.max(sprocketCount - sprocketTeeth.length, 0)),
    ]);
  }, [sprocketCount]);

  useEffect(() => {
    if (cassetteID !== 'custom') {
      const cassette = CASSETTE_DB[cassetteID];
      setSprocketCount(cassette.sprockets.length);
      setSprocketTeeth(cassette.sprockets);
    }
  }, [cassetteID]);

  useEffect(() => {
    if (tireID !== 'custom') {
      const tire = TIRE_DB[tireID];
      setETRTOWidth(tire.ETRTOSize[0]);
      setETRTODiameter(tire.ETRTOSize[1]);
    }
  }, [tireID]);

  return (
    <div className="App">
      <table>
        <tr>
          <td>
            <label>Tire</label>
          </td>
          <td>
            <select
              onChange={(e) => setTireID(e.target.value as TireID)}
              value={tireID}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
          <td>
            <label>ETRTO Width</label>
          </td>
          <td>
            <input
              type="number"
              onChange={(e) => {
                setETRTOWidth(e.target.valueAsNumber);
                setTireID('custom');
              }}
              value={ETRTOWidth}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </td>
        </tr>
        <tr>
          <td>
            <label>ETRTO Diameter</label>
          </td>
          <td>
            <input
              type="number"
              onChange={(e) => {
                setETRTODiameter(e.target.valueAsNumber);
                setTireID('custom');
              }}
              value={ETRTODiameter}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </td>
        </tr>
        <tr>
          <td>
            <label>Tire Diameter</label>
          </td>
          <td>
            <input
              type="number"
              disabled
              value={ETRTOtoDiameter(ETRTOWidth, ETRTODiameter) / 25.4}
              className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-not-allowed "
            />
          </td>
        </tr>
        <tr>
          <td>
            <label>Tire Circumference</label>
          </td>
          <td>
            <input
              type="number"
              disabled
              value={ETRTOtoCircumference(ETRTOWidth, ETRTODiameter)}
              className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-not-allowed "
            />
          </td>
        </tr>
      </table>
      <div>
        <label>Chainring Teeth</label>
        <input
          type="number"
          onChange={(e) => setChainringTeeth(e.target.valueAsNumber)}
          value={chainringTeeth}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div>
        <label>Cassette</label>
        <select
          onChange={(e) => setCassetteID(e.target.value as CassetteID)}
          value={cassetteID}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="custom">Custom</option>
          {Object.entries(CASSETTE_DB).map(([name]) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
        <label>Sprockets</label>
        <input
          type="number"
          onChange={(e) => {
            setSprocketCount(e.target.valueAsNumber);
            setCassetteID('custom');
          }}
          value={sprocketCount}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
        {Array(sprocketCount)
          .fill(0)
          .map((v, i) => (
            <div key={i}>
              <input
                type="number"
                onChange={(e) => {
                  setSprocketTeeth(
                    sprocketTeeth.with(i, e.target.valueAsNumber),
                  );
                  setCassetteID('custom');
                }}
                value={sprocketTeeth[i]}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <div>
                {gearInches(
                  ETRTOtoDiameter(ETRTOWidth, ETRTODiameter) / 25.4,
                  chainringTeeth,
                  sprocketTeeth[i],
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
