import "../globals.css";
import Header from '@/components/Header';

export const metadata = {
  title: "SustainEarth",
  description: "SustainEarth is a platform for sharing and learning about sustainability.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header/>
        <main>{children}</main>
    </>
  );
}
