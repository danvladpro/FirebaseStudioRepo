import { EXAM_SET } from '@/lib/challenges';
import { HomePageClient } from '@/components/home-page-client';

export default function DashboardPage() {
  return (
    <HomePageClient examSet={EXAM_SET} />
  );
}
