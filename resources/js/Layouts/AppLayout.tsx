import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useAuthStore } from '@/Stores/useAuthStore';
import { useUIStore } from '@/Stores/useUIStore';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/Types';

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

export default function AppLayout({ children, title, breadcrumbs }: AppLayoutProps) {
    const { flash } = usePage<PageProps>().props;
    const theme = useAuthStore((s) => s.theme);
    const { sidebarOpen } = useUIStore();

    // Dark mode sync
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else if (theme === 'light') root.classList.remove('dark');
        else {
            window.matchMedia('(prefers-color-scheme: dark)').matches
                ? root.classList.add('dark')
                : root.classList.remove('dark');
        }
    }, [theme]);

    // Flash messages
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <div className={cn('hidden md:flex', !sidebarOpen && 'md:hidden')}>
                <Sidebar />
            </div>

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar title={title} breadcrumbs={breadcrumbs} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
