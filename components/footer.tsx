import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">JobPortal</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Find your dream job or the perfect candidate for your company.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-muted-foreground hover:text-foreground">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="text-muted-foreground">Email: contact@jobportal.com</li>
              <li className="text-muted-foreground">Phone: (123) 456-7890</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} JobPortal. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

