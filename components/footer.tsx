"use client"
import { cn } from '@/lib/utils'
import Logo from './logo'

type PropType = {
    className?:string
}

const Footer = ({className}:PropType) => {
    return (
        <footer className={cn(`border-t bg-card py-12 px-4`, className)}>
            <div className={`max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8`}>
                <div>
                    <Logo className="mb-4" />
                    <p className="text-sm text-muted-foreground">Banking-as-a-Service platform powered by Rex MFB.</p>
                </div>
                <div>
                    <h4 className="font-display font-semibold mb-3">Product</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="hover:text-foreground cursor-pointer">Payments</li>
                        <li className="hover:text-foreground cursor-pointer">Transfers</li>
                        <li className="hover:text-foreground cursor-pointer">Wallets</li>
                        <li className="hover:text-foreground cursor-pointer">Virtual Accounts</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-display font-semibold mb-3">Developers</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="hover:text-foreground cursor-pointer" onClick={() => window.open("https://docs.rexbaas.com", "_blank")}>API Docs</li>
                        <li className="hover:text-foreground cursor-pointer">SDKs</li>
                        <li className="hover:text-foreground cursor-pointer">Changelog</li>
                        <li className="hover:text-foreground cursor-pointer">Status</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-display font-semibold mb-3">Company</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="hover:text-foreground cursor-pointer">Support</li>
                        <li className="hover:text-foreground cursor-pointer">Contact</li>
                        <li className="hover:text-foreground cursor-pointer">Privacy Policy</li>
                        <li className="hover:text-foreground cursor-pointer">Terms of Service</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Rex MFB. All rights reserved.
            </div>
        </footer>
    )
}

export default Footer