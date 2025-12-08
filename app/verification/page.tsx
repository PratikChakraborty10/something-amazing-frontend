import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VerificationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4 pb-2">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Email Verified</CardTitle>
            <CardDescription className="text-base">
              Your email address has been successfully verified.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-sm">
            You can now access all features of your account. Thank you for verifying your identity.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          <Button asChild className="w-full sm:w-auto min-w-[200px]">
            <Link href="/">
              Continue to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
