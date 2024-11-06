import "../globals.css";
import Header_M from "@/components/Header_M";
export const metadata = {
  title: "MarketPlace",
  description: "MarketPlace is a platform for buying and selling goods.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header_M/>
        <main>{children}</main>
    </>
    
  );
}
