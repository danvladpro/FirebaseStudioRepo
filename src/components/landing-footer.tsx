import { Logo } from "./logo";

export function LandingFooter() {
    return (
        <footer className="w-full border-t">
            <div className="container flex items-center justify-between py-6">
                <Logo />
                <p className="text-sm text-muted-foreground">&copy; 2024 Excel Ninja. All rights reserved.</p>
            </div>
        </footer>
    );
}
