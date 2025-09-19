import { CHALLENGE_SETS } from '@/lib/challenges';
import { HomePageClient } from '@/components/home-page-client';

export default function Home() {
  return (
    <HomePageClient challengeSets={CHALLENGE_SETS} />
  );
}
