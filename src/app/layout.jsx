import './globals.css'

export const metadata = {
  title: 'Band Billing App',
  description: 'Build a smarter festival lineup with Spotify and Instagram audience data.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
