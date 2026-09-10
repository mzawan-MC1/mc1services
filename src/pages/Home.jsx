import SEOHead from '../components/SEOHead';
import HomeSections from '../components/home/HomeSections';

export default function Home() {
  return (
    <div>
      <SEOHead pageIdentifier="home" />
      <HomeSections />
    </div>
  );
}
