import "../globals.css";
import Header_FH from '@/components/Header_FH';

export const metadata = {
  title: "FoodHub",
  description: "FoodHub is a platform for donating and receiving food.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header_FH />
        <main>{children}</main>
    </>
  );
}
