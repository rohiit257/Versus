"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "./navbar/NavbarClient";

export function HeroSectionOne() {
  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center bg-black">
      <Navbar />

      {/* Gradient lines */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/10 dark:bg-neutral-800/50">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/10 dark:bg-neutral-800/50">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/10 dark:bg-neutral-800/50">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
      </div>

      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-white md:text-4xl lg:text-7xl">
          {"Can't decide? Let the community help you choose!"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-emerald-400"
        >
          Submit your dilemma with two choices and let other users vote to help you make the best decision. Join the community that helps each other choose wisely.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-60 rounded-lg bg-zinc-800 px-6 py-2 font-medium text-white transition-all duration-300 border border-zinc-700 hover:bg-zinc-700"
            >
              Get Started
            </motion.button>
          </Link>
          <Link href="/how-it-works">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-60 rounded-lg bg-transparent px-6 py-2 font-medium text-emerald-400 transition-all duration-300 border border-emerald-400 hover:bg-emerald-400 hover:text-black"
            >
              How it Works
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="relative z-10 mt-20"
        >
          <h2 className="text-2xl font-bold text-center text-white mb-12">How Versus Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Share Your Dilemma", desc: "Post your question with two choices you're torn between" },
              { step: "2", title: "Community Votes", desc: "Other users vote and share their reasoning" },
              { step: "3", title: "Make Your Choice", desc: "Get insights from the community to make the best decision" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                  <span className="text-emerald-400 text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-emerald-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Example Dilemma Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.5 }}
          className="relative z-10 mt-20 rounded-3xl border border-emerald-500 bg-zinc-900 p-8 shadow-xl animate-border-glow-emerald"
        >
          <h3 className="text-2xl font-bold text-center text-white mb-8">See How It Works</h3>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-white">Should I take the job offer in another city?</p>
              <p className="text-sm text-emerald-400 mt-2">Posted by @user123</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Option A: Take the job",
                  desc: "Better salary, career growth, new experiences",
                  votes: "267 votes (65%)",
                },
                {
                  title: "Option B: Stay here",
                  desc: "Close to family, established life, comfort zone",
                  votes: "143 votes (35%)",
                },
              ].map((opt, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                >
                  <h4 className="font-semibold text-white mb-2">{opt.title}</h4>
                  <p className="text-sm text-emerald-400 mb-3">{opt.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold">{opt.votes}</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="bg-emerald-400 text-black px-3 py-1 rounded-md text-sm font-medium"
                    >
                      Vote
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}