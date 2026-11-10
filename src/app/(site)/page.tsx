import { Nav } from "@/components/nav";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Products } from "@/components/sections/products";
import { Services } from "@/components/sections/services";
import { Stack } from "@/components/sections/stack";
import { Marquee, Stats } from "@/components/sections/stats";
import { Work } from "@/components/sections/work";
import { Writing } from "@/components/sections/writing";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Stats />
        <Marquee />
        <About />
        <Services />
        <Process />
        <Work />
        <Products />
        <Stack />
        <Writing />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
