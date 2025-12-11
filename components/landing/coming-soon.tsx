"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Rocket,
    ArrowLeft,
    Mail,
    Sparkles,
    Clock,
    Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ComingSoonProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
}

export function ComingSoon({
    title,
    description = "We're working hard to bring you something amazing. Stay tuned!",
    icon,
}: ComingSoonProps) {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setEmail("");
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden px-4 py-16">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/30 rounded-full"
                        initial={{
                            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                        }}
                        animate={{
                            y: [null, -20, 20],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: Math.random() * 2,
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-2xl mx-auto text-center"
            >
                {/* Glassmorphism card */}
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
                        className="mb-6"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
                            {icon || <Rocket className="w-10 h-10 text-primary-foreground" />}
                        </div>
                    </motion.div>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20"
                    >
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Coming Soon</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text"
                    >
                        {title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
                    >
                        {description}
                    </motion.p>

                    {/* Email subscription */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-8"
                    >
                        {!isSubscribed ? (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                                        required
                                    />
                                </div>
                                <Button type="submit" size="lg" className="h-12 px-6 gap-2 shadow-lg shadow-primary/25">
                                    <Bell className="w-4 h-4" />
                                    Notify Me
                                </Button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary/10 border border-primary/20"
                            >
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span className="font-medium text-primary">Thanks! We&apos;ll notify you when we launch.</span>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Features preview */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="grid grid-cols-3 gap-4 mb-8 pt-8 border-t border-border/50"
                    >
                        {[
                            { label: "Quality First", icon: "✨" },
                            { label: "User Focused", icon: "💜" },
                            { label: "Coming Soon", icon: "🚀" },
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl mb-1">{item.icon}</div>
                                <div className="text-xs text-muted-foreground">{item.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Back button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Link href="/">
                            <Button variant="ghost" size="lg" className="gap-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
