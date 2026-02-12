export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-montserrat antialiased">
      {children}
    </div>
  );
}