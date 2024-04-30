import Image from "next/image";
import { Logo } from "../components/logo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center relative">
      <Image src="/hero.webp" alt="hero" fill className="absolute" />
      <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-sm">
        <Logo />
        <p>
          The AI-powered SAAS solution to auto generate SEO friendly blog posts
          for your website. Saving your time and get top-quality content in
          minutes!
        </p>
        <Link href="/post/new" className="btn mt-2">
          Try Now
        </Link>
      </div>
    </div>
  );
}
