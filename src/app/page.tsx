import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import PublicBadgeChecker from '@/components/public/badge-checker';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background to-secondary/50">
        <div className="container px-4 md:px-6 text-center">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Decentralized Identity for Your Organization
            </h1>
            <p className="max-w-[700px] mx-auto text-muted-foreground text-lg md:text-xl">
              OrgSpace leverages zkLogin on the Sui blockchain to provide secure, verifiable, and private membership credentials for your university or organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <Button asChild size="lg">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2" />
                </Link>
              </Button>
               <Button asChild variant="secondary" size="lg">
                <Link href="/#check-badge">
                  Verify a Badge
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-semibold tracking-wider uppercase">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why OrgSpace?</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Empower your members with self-sovereign identity while simplifying administrative overhead.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
            <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-2">zkLogin Integration</h3>
                <p className="text-sm text-muted-foreground">Seamless and secure onboarding using existing Google accounts. No need for new passwords or seed phrases.</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                        <Users className="h-8 w-8" />
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Verifiable Credentials</h3>
                <p className="text-sm text-muted-foreground">Issue tamper-proof digital membership badges on the Sui blockchain that can be verified by anyone, anywhere.</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Admin Control</h3>
                <p className="text-sm text-muted-foreground">Manage members and control access with a secure admin dashboard, protected by zkLogin.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Badge Checker Section */}
      <section id="check-badge" className="w-full py-16 md:py-24 lg:py-32 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground tracking-wider uppercase">Verification</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                    Public Badge Verification
                </h2>
                <p className="text-muted-foreground md:text-lg/relaxed">
                    Publicly verify the authenticity of a OrgSpace membership badge using its on-chain identifiers. Enter the badge ID and zkLogin address to confirm its status.
                </p>
            </div>
            <div className="w-full">
                <Card>
                    <CardContent className="p-6">
                         <PublicBadgeChecker />
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
