import { QuoteForm } from "@/components/quote-form";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <span className="text-lg font-semibold text-gray-900">Get a Quote</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-8">
        <QuoteForm isOpen={true} onClose={() => {}} inline={true} />
      </main>
    </div>
  );
}
