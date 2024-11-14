import "../globals.css";
import Header from '@/components/Header';

export const metadata = {
  title: "DashBoard",
  description: "DashBoard",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header/>
        <main>{children}</main>
    </>
  );
}
