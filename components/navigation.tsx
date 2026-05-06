"use client"
import Logo from './logo'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

const Navigation = () => {
    const router = useRouter()
    return (

        <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Logo />
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm"
                        onClick={() => window.open("https://docs.rexbaas.com", "_blank")}>
                        API Docs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push("/login")}>Sign In</Button>
                    <Button size="sm" className="gradient-primary text-primary-foreground"
                        onClick={() => router.push("/signup")}>
                        Create Account
                    </Button>
                </div>
            </div>
        </nav>
    )
}

export default Navigation