import "../globals.css";
import Header_LS from '@/components/Header_LS';

export const metadata = {
  title: "Learn&Share",
  description: "Learn&Share is a platform for learning and sharing knowledge.",
};

export default function RootLayout({ children }) {
  return (
    <>
        <Header_LS />
        <main>{children}</main>
    </>
  );
}
