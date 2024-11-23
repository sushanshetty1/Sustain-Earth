import "../globals.css";
import Header_M from "@/components/HeaderAdmin";

export const metadata = {
  title: "About Us",
  description: "Learn more about our team and our mission.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header_M/>
        <main>{children}</main>
    </>
    
  );
}
