import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, ShieldCheck } from 'lucide-react';
import PublicBadgeChecker from '@/components/public/badge-checker';
import { getPlaceholderImage } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = getPlaceholderImage('hero-background');

  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  Decentralized Identity for Your Organization
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  SuiOrg leverages zkLogin on the Sui blockchain to provide secure, verifiable, and private membership credentials for your university or organization.
                </p>
              </div>
            </div>
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                width={600}
                height={400}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            )}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why SuiOrg?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Empower your members with self-sovereign identity while simplifying administrative overhead.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-background transition-colors">
              <CheckCircle className="h-10 w-10 mx-auto text-primary" />
              <h3 className="text-lg font-bold">zkLogin Integration</h3>
              <p className="text-sm text-muted-foreground">Seamless and secure onboarding using existing Google accounts. No need for new passwords or seed phrases.</p>
            </div>
            <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-background transition-colors">
              <Users className="h-10 w-10 mx-auto text-primary" />
              <h3 className="text-lg font-bold">Verifiable Credentials</h3>
              <p className="text-sm text-muted-foreground">Issue tamper-proof digital membership badges on the Sui blockchain that can be verified by anyone, anywhere.</p>
            </div>
            <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-background transition-colors">
              <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
              <h3 className="text-lg font-bold">Admin Control</h3>
              <p className="text-sm text-muted-foreground">Manage members and control access with a secure admin dashboard, protected by zkLogin.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="check-badge" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              Public Badge Verification
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Publicly verify the authenticity of a SuiOrg membership badge using its on-chain identifiers.
            </p>
          </div>
          <div className="mx-auto w-full max-w-md space-y-2 mt-6">
            <PublicBadgeChecker />
          </div>
        </div>
      </section>
    </div>
  );
}
