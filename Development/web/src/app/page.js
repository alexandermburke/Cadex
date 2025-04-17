import Head from "next/head"
import CoolLayout from "@/components/CoolLayout"
import Hero from "@/components/Hero"
import Main from "@/components/Main"
import Product from "@/components/Product"
import Benefits from "@/components/Home"

export default function Home() {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CoolLayout>
        <Main>
          <Hero />
          <Product />
          <Benefits />
        </Main>
      </CoolLayout>
    </>
  )
}
