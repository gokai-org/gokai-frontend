import GraphNavBar from "@/features/graph/components/GraphNavBar";

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GraphNavBar />
      {children}
    </>
  );
}
