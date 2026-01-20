import { Navbar } from "@/components/Navbar";
import { useUserStore } from "@/store/userStore";

export default function SubRootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}