import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TerminalSquare, MailCheck } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
            <TerminalSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Alpha Agent</span>
        </Link>
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <MailCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link. Click it to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Once confirmed, you&apos;ll be redirected to your terminal automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
