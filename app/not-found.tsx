"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col pt-16">
            <LandingNav />
            <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4">
                {/* Animated starfield background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
                    {/* Stars */}
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-0.5 h-0.5 bg-foreground/30 rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0.1, 0.8, 0.1],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                        />
                    ))}
                </div>

                {/* Floating orbital rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[600px] h-[600px] border border-primary/10 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[400px] h-[400px] border border-primary/5 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[200px] h-[200px] border border-primary/5 rounded-full"
                    />
                </div>

                {/* Main content */}
                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    {/* Animated 404 */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="mb-8"
                    >
                        <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter bg-gradient-to-br from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent select-none">
                            404
                        </h1>
                    </motion.div>

                    {/* Floating compass icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="mb-6"
                    >
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-sm"
                        >
                            <Compass className="w-10 h-10 text-primary" />
                        </motion.div>
                    </motion.div>

                    {/* Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Oops! You&apos;re lost in space
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            The page you&apos;re looking for has drifted into the void. Let&apos;s get you back on track.
                        </p>
                    </motion.div>

                    {/* Action buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                    >
                        <Link href="/">
                            <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 min-w-[160px]">
                                <Home className="w-4 h-4" />
                                Go Home
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="lg"
                            className="gap-2 min-w-[160px]"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                    </motion.div>

                    {/* Helpful links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="pt-8 border-t border-border/50"
                    >
                        <p className="text-sm text-muted-foreground mb-4">
                            Here are some helpful links:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Documentation", href: "/documentation" },
                                { label: "Help Center", href: "/help-center" },
                                { label: "Contact", href: "/contact" },
                            ].map((link, index) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
            <LandingFooter />
        </div>
    );
}

