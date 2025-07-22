import type { Metadata } from "next";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@govbr-ds/core/dist/core.min.css";
import "../assets/arquivo-fonte-rawline.css";
import "../assets/arquivo-fonte-raleway.css";
export declare const metadata: Metadata;
export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>): import("react").JSX.Element;
