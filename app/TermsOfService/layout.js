import "../globals.css";
import Header_M from "@/components/HeaderAdmin";

export const metadata = {
  title: "TermsOfService",
  description: "Our terms of service outline the rules and regulations for using our platform.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header_M/>
        <main>{children}</main>
    </>
    
  );
}
