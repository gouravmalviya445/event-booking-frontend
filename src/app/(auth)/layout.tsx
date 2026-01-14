export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-amber-50 dark:bg-gray-800 p-4">
      {children}
    </div>
  );
}