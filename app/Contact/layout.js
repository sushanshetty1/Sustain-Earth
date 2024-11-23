import "../globals.css";
import Header_M from "@/components/HeaderAdmin";

export const metadata = {
  title: "Contact Us",
  description: "Have questions or feedback? Reach out to us.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header_M/>
        <main>{children}</main>
    </>
    
  );
}
