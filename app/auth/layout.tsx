export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-perfil-light/30 min-h-screen antialiased">
      {children}
    </div>
  )
}
