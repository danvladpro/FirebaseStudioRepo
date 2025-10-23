
import { ALL_EXAM_SETS } from '@/lib/challenges';
import { HomePageClient } from '@/components/home-page-client';

export default function DashboardPage() {
  return (
    <HomePageClient examSets={ALL_EXAM_SETS} />
  );
}
