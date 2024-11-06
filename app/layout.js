import "./globals.css";
import Footer from "@/components/Footer";
export const metadata = {
  title: "SustainEarth",
  description: "SustainEarth is a platform for sustainable living.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#f9f6f4]">
        {children}
        <Footer />
      </body>
    </html>
  );
}
