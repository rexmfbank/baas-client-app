import { Zap } from "lucide-react"
import Link from "next/link"

const Logo = ({url="/", className}:{url?:string, className?:string}) => {
    return (
        <Link href={url} className={`flex items-center gap-2 cursor-pointer ${className}`}>
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Rex BaaS</span>
        </Link>
    )
}

export default Logo