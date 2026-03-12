import { Button } from "@/components/ui/button"
import Link from "next/link"

const Notfound = () => {
  return (
    <div className="container mx-auto flex flex-col justify-center items-center h-screen">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg">Sorry, the page you are looking for does not exist.</p>
        <Button variant="link" className="bg-foreground mt-6 flex items-center" asChild>
          <Link href="/" className="mr-2 text-white hover:text-gray-300">Go back to Home</Link>
        </Button>

    </div>
  )
}
export default Notfound