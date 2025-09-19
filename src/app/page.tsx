
import { CHALLENGE_SETS, EXAM_SET } from '@/lib/challenges';
import { HomePageClient } from '@/components/home-page-client';

export default function Home() {
  return (
    <HomePageClient challengeSets={CHALLENGE_SETS} examSet={EXAM_SET} />
  );
}
