import "../globals.css";
import Header_M from "@/components/HeaderAdmin";

export const metadata = {
  title: "Privacy Policy",
  description: "Your privacy matters to us. Learn how we collect, use, and protect your personal information.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header_M/>
        <main>{children}</main>
    </>
    
  );
}
