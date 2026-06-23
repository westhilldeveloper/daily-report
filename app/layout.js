import './globals.css';
export const metadata = {
    title: 'Daily Report Manager',
    description: 'Upload, filter, and export daily reports',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="bg-gray-50">{children}</body>
        </html>
    );
}