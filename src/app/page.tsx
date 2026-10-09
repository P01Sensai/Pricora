import { Search, Tag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Tag size={18} />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Pricora
            </span>
          </div>
          
          {/* Temporary desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Deals</a>
            <a href="#" className="hover:text-foreground transition-colors">Categories</a>
            <a href="#" className="hover:text-foreground transition-colors">Brands</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-[1200px] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Never overpay again.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Compare prices across Amazon, Flipkart, Croma, and more. Instantly know if it's a good deal.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-xl border-0 py-4 pl-10 pr-4 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-card shadow-sm transition-shadow hover:shadow-md"
                placeholder="Search for a product..."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
