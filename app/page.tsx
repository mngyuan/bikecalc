'use client';

import {useEffect, useState} from 'react';
import {SaveIcon} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {TooltipProvider} from '@/components/ui/tooltip';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  Bike,
  BIKE_DB,
  BikeID,
  CASSETTE_DB,
  CassetteID,
  InternallyGearedHub,
  isInternallyGearedHub,
  TIRE_DB,
  TireID,
} from '@/lib/data';
import {Card, CardContent} from '@/components/ui/card';

const ETRTOtoDiameter = (ETRTOWidth: number, ETRTODiameter: number): number =>
  ETRTOWidth * 2 + ETRTODiameter;

const ETRTOtoCircumference = (
  ETRTOWidth: number,
  ETRTODiameter: number,
): number => Math.PI * ETRTOtoDiameter(ETRTOWidth, ETRTODiameter);

// Theoretical size of the same tire in inches which would have the equivalent development with a 1:1 gear ratio
const gearInches = (
  ETRTOWidth: number,
  ETRTODiameter: number,
  chainringTooth: number,
  sprocketTeeth: number,
): number =>
  ((ETRTOtoDiameter(ETRTOWidth, ETRTODiameter) / 25.4) * chainringTooth) /
  sprocketTeeth;

// How far the bike travels in meters for one complete revolution of the pedals
const metersDevelopment = (
  ETRTOWidth: number,
  ETRTODiameter: number,
  chainringTooth: number,
  sprocketTeeth: number,
) =>
  (ETRTOtoCircumference(ETRTOWidth, ETRTODiameter) * chainringTooth) /
  1000 /
  sprocketTeeth;

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

function createMapRangeWithMidToColor(
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

function createMapRangeToColor(
  colorMin: ColorValueHex,
  colorMax: ColorValueHex,
) {
  return function (value: number, min: number, max: number) {
    // Scale value from min to max (0 to 1)
    const factor = (value - min) / (max - min);
    return interpolateColor(colorMin, colorMax, factor);
  };
}

const mapGearInchesToColor = (gearInches: number) =>
  createMapRangeWithMidToColor('#56bb8a', '#fed666', '#e67c73')(
    gearInches,
    20,
    120,
  );

const mapMetersDevelopmentToColor = (metersDevelopment: number) =>
  // map from very light blue to dark blue
  createMapRangeToColor('#d0e2f3', '#3d85c6')(metersDevelopment, 1, 10);

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
  const bikeTire = TIRE_DB[bike.tire];
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

const CalculationsRow = ({
  sprocketCount,
  sprocketTeeth,
  chainringTooth,
  ETRTODiameter,
  ETRTOWidth,
  calculation,
  calculationColoration,
  formatNumber = (n: number) => Math.round(n),
  ratio,
}: {
  sprocketCount: number;
  sprocketTeeth: number[];
  chainringTooth: number;
  ETRTODiameter: number;
  ETRTOWidth: number;
  calculation: (
    ETRTOWidth: number,
    ETRTODiameter: number,
    chainringTooth: number,
    sprocketTeeth: number,
  ) => number;
  calculationColoration: (calculationResult: number) => string;
  formatNumber?: (n: number) => number | string;
  ratio?: number;
}) => [
  ...Array(sprocketCount)
    .fill(0)
    .map((v, i) => {
      const gI =
        calculation(
          ETRTOWidth,
          ETRTODiameter,
          chainringTooth,
          sprocketTeeth[i] / (ratio || 1),
        ) || 0;
      return (
        <div
          key={i}
          className={`w-10 h-8 text-center p-1 min-w-0`}
          style={{backgroundColor: calculationColoration(gI)}}
        >
          {formatNumber(gI)}
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
  className = '',
}: {
  bike?: Bike;
  onCustomized: (customized: boolean) => void;
  className?: string;
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
  const [calculationToDisplay, setCalculationToDisplay] = useState<
    'gearInches' | 'metersDevelopment'
  >('gearInches');

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

  const CompleteCalculationsTable = (
    <div className="border border-grey-300 rounded max-w-full">
      <div className="flex flex-row">
        <div className="w-10 text-center p-2 text-xs">Gear</div>
        {[...Array(sprocketCount)].fill(0).map((v, i) => (
          <div key={i} className="w-10 text-center p-1">
            {sprocketCount - i}
          </div>
        ))}
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col">
          {chainringTeeth.map((chainringTooth, i) =>
            (cassetteID !== 'custom' && CASSETTE_DB[cassetteID].isIGH
              ? CASSETTE_DB[cassetteID].ratios.toReversed()
              : [undefined]
            ).map((ratio, j) => (
              <div key={j} className="w-10 text-center p-1">
                {chainringTeeth.length - i}
              </div>
            )),
          )}
        </div>
        <div className="rounded overflow-hidden">
          {chainringTeeth.map((chainringTooth) =>
            (cassetteID !== 'custom' && CASSETTE_DB[cassetteID].isIGH
              ? CASSETTE_DB[cassetteID].ratios.toReversed()
              : [undefined]
            ).map((ratio, i) => (
              <div className="flex flex-row" key={i}>
                <CalculationsRow
                  {...{
                    sprocketCount,
                    sprocketTeeth,
                    chainringTooth,
                    ETRTODiameter,
                    ETRTOWidth,
                    ratio,
                    calculation:
                      calculationToDisplay === 'gearInches'
                        ? gearInches
                        : metersDevelopment,
                    calculationColoration:
                      calculationToDisplay === 'gearInches'
                        ? mapGearInchesToColor
                        : mapMetersDevelopmentToColor,
                    formatNumber:
                      calculationToDisplay === 'gearInches'
                        ? (n) => Math.round(n)
                        : (n) => n.toFixed(1),
                  }}
                />
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className={`bike-calc ${className}`}>
        <div className="flex flex-col items-start space-y-2">
          <div className="flex flex-row items-center space-between">
            <Label className="mr-4">Tire</Label>{' '}
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
              className="bg-white flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
            >
              <option value="custom">Custom</option>
              {Object.entries(TIRE_DB).map(([name]) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row items-center justify-between space-x-6">
            <div className="flex flex-row items-center">
              <Label className="mr-4">ETRTO Width</Label>{' '}
              <Input
                type="number"
                onChange={(e) => {
                  setETRTOWidth(e.target.valueAsNumber);
                  setTireID('custom');
                }}
                value={ETRTOWidth}
                className="w-10 mr-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <span className="text-sm">mm</span>
            </div>
            <div className="flex flex-row items-center">
              <Label className="mr-4">ETRTO Diameter</Label>{' '}
              <Input
                type="number"
                onChange={(e) => {
                  setETRTODiameter(e.target.valueAsNumber);
                  setTireID('custom');
                }}
                value={ETRTODiameter}
                className="w-12 mr-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <span className="text-sm">mm</span>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between space-x-6">
            <div className="flex flex-row items-center">
              <Label className="mr-4">Tire Diameter</Label>{' '}
              <Input
                type="number"
                disabled
                value={(
                  ETRTOtoDiameter(ETRTOWidth, ETRTODiameter) / 25.4
                ).toFixed(2)}
                className="w-14 mr-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-not-allowed "
              />
              <span className="text-sm">in.</span>
            </div>
            <div className="flex flex-row items-center">
              <Label className="mr-4">Tire Circumference</Label>
              <Input
                type="number"
                disabled
                value={Math.round(
                  ETRTOtoCircumference(ETRTOWidth, ETRTODiameter),
                )}
                className="w-14 mr-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-not-allowed "
              />
              <span className="text-sm">mm</span>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col items-start space-y-2">
          <div className="flex flex-row items-center">
            <Label className="mr-4">Number of Chainrings</Label>
            <Input
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
              className="w-9 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div className="flex flex-row items-start">
            <Label className="mr-4 mt-3 shrink-0">Chainring Teeth</Label>
            <div className="flex flex-row flex-wrap">
              {Array(chainringCount)
                .fill(0)
                .map((v, i) => (
                  <div className="p-1" key={i}>
                    <Input
                      type="number"
                      onChange={(e) =>
                        setChainringTeeth(
                          chainringTeeth.with(i, e.target.valueAsNumber),
                        )
                      }
                      value={chainringTeeth[i]}
                      className="w-10 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                ))}
            </div>
          </div>
          <div className="flex flex-row items-center">
            <Label className="mr-4">Cassette / Hub</Label>
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
              className="bg-white flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
            >
              <option value="custom">Custom</option>
              {Object.entries(CASSETTE_DB).map(([name]) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row items-center">
            <Label className="mr-4">Number of Sprockets</Label>
            <Input
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
              className="w-9 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          {cassetteID !== 'custom' && CASSETTE_DB[cassetteID].isIGH && (
            <div className="flex flex-row items-center">
              <Label className="mr-4">Ratios</Label>
              <div className="flex flex-row flex-wrap space-x-1">
                {Array(CASSETTE_DB[cassetteID].ratios.length)
                  .fill(0)
                  .map((v, i) => (
                    <Input
                      key={i}
                      type="number"
                      disabled
                      value={(
                        CASSETTE_DB[cassetteID] as InternallyGearedHub
                      ).ratios[i].toFixed(2)}
                      className="w-12 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-not-allowed "
                    />
                  ))}
              </div>
            </div>
          )}
          <div className="flex flex-row items-start">
            <Label className="mr-4 mt-3 shrink-0">Sprocket Teeth</Label>
            <div className="flex flex-row flex-wrap">
              {Array(sprocketCount)
                .fill(0)
                .map((v, i) => (
                  <div className="p-1" key={i}>
                    <Input
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
                      className="w-10 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col items-start space-y-2">
          <div className="flex flex-row items-center">
            <Tabs
              defaultValue="gearInches"
              onValueChange={(value) =>
                setCalculationToDisplay(
                  value as 'gearInches' | 'metersDevelopment',
                )
              }
            >
              <TabsList className="flex flex-row">
                <TabsTrigger value="gearInches">Gear Inches</TabsTrigger>
                <TabsTrigger value="metersDevelopment">
                  Meters Development
                </TabsTrigger>
                <TabsTrigger value="speed">Speed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {CompleteCalculationsTable}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default function Home() {
  const [bikeID, setBikeID] = useState<BikeID | 'custom'>('custom');
  const [customized, setCustomized] = useState<boolean>(false);

  return (
    <div className="p-4 flex flex-row space-x-4 h-full w-full">
      <div className="flex flex-col items-start w-[32rem]">
        <h1 className="text-3xl font-bold mb-2">Bike Calc</h1>
        <p className="text-muted-foreground mb-2">
          Calculate gear inches, meters development, and more for your bike.
        </p>
        <div className="flex flex-row items-center space-between">
          <Label className="mr-4">Bike</Label>
          <div className="flex flex-row">
            <select
              onChange={(e) => setBikeID(e.target.value as BikeID)}
              value={bikeID}
              className="bg-white flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
            >
              <option value="custom">Custom</option>
              {Object.entries(BIKE_DB).map(([name]) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              className={`ml-2 ${customized ? '' : 'hidden'}`}
            >
              <SaveIcon />
            </Button>
          </div>
        </div>
        <Card className="mt-4 flex w-full">
          <CardContent className="flex p-4 w-full">
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
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>
      {/* TODO: something needs to be done here with sizing, the canvas in BikeViewer won't resize properly */}
      <div className="flex flex-col grow">
        <Card className="w-full grow">
          <CardContent className="p-4"></CardContent>
        </Card>
      </div>
    </div>
  );
}
