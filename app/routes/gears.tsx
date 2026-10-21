import {GearCalculator} from '@/components/gears/GearCalculator';

export const meta = () => [
  {title: 'Gear Calculator · Bike Calc'},
  {name: 'description', content: 'Bike calculator for gear inches, meters development, cadence speed and more.'},
];

export default function GearsRoute() {
  return <GearCalculator />;
}
