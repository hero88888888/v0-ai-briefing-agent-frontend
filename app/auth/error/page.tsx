import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TerminalSquare } from "lucide-react"
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
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-2">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Authentication error</CardTitle>
            <CardDescription>
              Something went wrong while signing you in. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
