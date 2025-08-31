import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import {ConfigProvider} from "@/app/ConfigProvider";
import {DEFAULT_DOMAIN_URL} from "@/app/avatar/constants";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Avatar Playground",
    description: "Avatar Playground",
};

export const dynamic = "force-dynamic"


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const baseUrl = process.env.SERVER_DOMAIN

    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConfigProvider baseUrl={baseUrl}>
            <main>{children}</main>
        </ConfigProvider>
        <Toaster position="top-center" />
        </body>
        </html>
    );
}
