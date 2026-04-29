import "./globals.css";

export const metadata = {
  title: "Property Dealer CRM",
  description: "Real Estate Lead Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
