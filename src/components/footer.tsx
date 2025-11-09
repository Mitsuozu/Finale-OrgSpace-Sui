import React from 'react';

export default function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 bg-secondary">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          OrgSpace &copy; {new Date().getFullYear()}. Decentralized University Membership.
        </p>
      </div>
    </footer>
  );
}
