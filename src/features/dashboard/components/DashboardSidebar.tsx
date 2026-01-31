// Path: src/features/dashboard/components/DashboardSidebar.tsx
"use client";

import Image from "next/image";
// ... imports

// ... inside the component
                    <Link href="/" className="mb-6 flex items-center px-4 pl-6">
                        <div className="relative h-10 w-full max-w-[150px]">
                             <Image 
                                src="/logo.png" 
                                alt="ProInsight Logo" 
                                width={150} 
                                height={40} 
                                className="object-contain"
                                priority
                             />
                        </div>
                    </Link>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.active ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={route.href}>
                                    <route.icon className="mr-2 h-4 w-4" />
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div >
            </div >
        </div >
    );
}
