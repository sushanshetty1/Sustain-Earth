import "./globals.css";
import Footer from "@/components/Footer";
export const metadata = {
  title: "SustainEarth",
  description: "SustainEarth is a platform for sustainable living.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-sans bg-[#f9f6f4]">
        {children}
        <Footer />
      </body>
    </html>
  );
}
