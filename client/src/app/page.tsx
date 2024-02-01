import HomeContent from '@/components/homeContent';
import Toolbar from '@/components/toolbar';
import { FC } from 'react';

const Home: FC = () => {
  return (
    <div>
      <Toolbar />
      <div className="w-full max-w-xl mx-auto">
        <HomeContent />
      </div>
    </div>
  )
};

export default Home;