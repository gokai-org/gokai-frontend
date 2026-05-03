import { OnboardingInterestsExperience } from "@/features/onboarding";

type InterestsPageProps = {
  searchParams: Promise<{
    plan?: string;
  }>;
};

export default async function InterestsPage({ searchParams }: InterestsPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialPlanVariant =
    resolvedSearchParams.plan === "premium" ? "premium" : "free";

  return (
    <OnboardingInterestsExperience initialPlanVariant={initialPlanVariant} />
  );
}
