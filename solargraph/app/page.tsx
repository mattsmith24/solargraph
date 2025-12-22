export const dynamic = 'force-dynamic';

import CurrentSolarStatus from './components/CurrentSolarStatus';

export default function Home() {
  return (
    <div>
      <CurrentSolarStatus />
    </div>
  );
}
